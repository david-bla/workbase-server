Meteor.methods({
  addMember(email, name, title) {
    check(name,  String);
    check(email, String);
    check(title, Match.Maybe(String));

    let userId = Accounts.createUser({
      email,
      profile: {
        type: 'Users',
        name,
        title
      }
    });

    let admin = Users.findOne(this.userId);
    let user = Users.findOne(userId);
    logUserAdmin(admin, {
      action: 'user.new',
      params: {
        user: user.email(),
        set: JSON.stringify(user.profile)
      }
    });

    return userId;
  },
  editMember(id, email, name, password, title) {
    check(id, String);
    check(name, String);
    check(email, String);
    check(password, Match.Maybe(String));
    check(title, Match.Maybe(String));

    let user = Users.findOne(id);
    if (user) {
      let changes = {};
      if (email != user.email()) {
        changes.email = {from: user.email(), to: email};
        Accounts.removeEmail(id, user.email());
        Accounts.addEmail(id, email);
      }
      if (password) {
        changes.password = "changed";
        Accounts.setPassword(id, password);
      }
      if (name != user.name()) {
        changes.name = {from: user.name(), to: name};
        Users.update(id, {$set: {"profile.name": name}});
      }
      if (title != user.title()) {
        changes.title = {from: user.title(), to: title};
        Users.update(id, {$set: {"profile.title": title}});
      }

      let admin = Users.findOne(this.userId);
      logUserAdmin(admin, {
        action: 'user.edit',
        params: {
          user: user.email(),
          set: JSON.stringify(changes)
        }
      });

      return id;
    }
  },
  editContact(id, params) {
    check(id, String);
    check(params, {
      name: Match.Maybe(String),
      email: Match.Maybe(String),
      title: Match.Maybe(String),
      company: Match.Maybe(String),
      noreply: Match.Maybe(Boolean)
    });

    let contact = Contacts.findOne(id);
    let mofifier = {};
    if (params.name != contact.name()) _.extend(mofifier, {"profile.name": params.name});
    if (params.title != contact.profile.title) _.extend(mofifier, {"profile.title": params.title});
    if (params.company != contact.profile.company) _.extend(mofifier, {"profile.company": params.company});
    if (params.noreply != contact.profile.noreply) _.extend(mofifier, {"profile.noreply": params.noreply});

    if (!_.isEmpty(mofifier)) {
      Contacts.update(id, {$set: mofifier});
    }

    if (params.email != contact.email()) {
      Accounts.removeEmail(id, contact.email());
      Accounts.addEmail(id, params.email);
    }
  }
});

const logUserAdmin = (admin, content) => {
  let thread = Threads.findOne({category: 'Roster'});
  Threads.addMessage(thread, admin, {
    contentType: 'log',
    content
  });
}
