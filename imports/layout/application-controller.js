ApplicationController = RouteController.extend({
  layoutTemplate: 'ApplicationLayout',
  loadingTemplate: 'spinner',
  notFoundTemplate: 'notFound',
  subscriptions() {
    this.subscribe("roster");
  },
  waitOn() {
    if (Meteor.user()) {
      return this.subscribe('instance');
    } else {
      this.redirect('/login');
    }
  },
  onAfterAction() {
    $('body').removeClass('sidebar-open');
  }
});
