(function() {
  var $$, ListView, SelectListView, git, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  git = require('../git');

  module.exports = ListView = (function(_super) {
    __extends(ListView, _super);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function() {
      ListView.__super__.initialize.apply(this, arguments);
      this.currentPane = atom.workspace.getActivePane();
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          _this.reject = reject;
          return _this.setup();
        };
      })(this));
    };

    ListView.prototype.getFilterKey = function() {
      return 'path';
    };

    ListView.prototype.setup = function() {
      this.setItems(atom.project.getPaths().map(function(p) {
        return {
          path: p,
          relativized: p.substring(p.lastIndexOf('/') + 1)
        };
      }));
      return this.show();
    };

    ListView.prototype.show = function() {
      this.filterEditorView.getModel().placeholderText = 'Initialize new repo where?';
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.focusFilterEditor();
      return this.storeFocusedElement();
    };

    ListView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.viewForItem = function(_arg) {
      var path, relativized;
      path = _arg.path, relativized = _arg.relativized;
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'text-highlight'
            }, relativized);
            return _this.div({
              "class": 'text-info'
            }, path);
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(_arg) {
      var path;
      path = _arg.path;
      this.resolve(path);
      return this.cancel();
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiZmlsZTovLy9DOi9Vc2Vycy9uaXZwLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi92aWV3cy9wcm9qZWN0cy1saXN0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxVQUFBLEVBQUQsRUFBSyxzQkFBQSxjQUFMLENBQUE7O0FBQUEsRUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FETixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDUTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx1QkFBQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSwwQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQURmLENBQUE7YUFFQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDcEIsVUFBQSxLQUFDLENBQUEsT0FBRCxHQUFXLE9BQVgsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLE1BQUQsR0FBVSxNQURWLENBQUE7aUJBRUEsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQUhvQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsRUFISjtJQUFBLENBQVosQ0FBQTs7QUFBQSx1QkFRQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQUcsT0FBSDtJQUFBLENBUmQsQ0FBQTs7QUFBQSx1QkFVQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsTUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXVCLENBQUMsR0FBeEIsQ0FBNEIsU0FBQyxDQUFELEdBQUE7QUFDcEMsZUFBTztBQUFBLFVBQ0wsSUFBQSxFQUFNLENBREQ7QUFBQSxVQUVMLFdBQUEsRUFBYSxDQUFDLENBQUMsU0FBRixDQUFZLENBQUMsQ0FBQyxXQUFGLENBQWMsR0FBZCxDQUFBLEdBQW1CLENBQS9CLENBRlI7U0FBUCxDQURvQztNQUFBLENBQTVCLENBQVYsQ0FBQSxDQUFBO2FBS0EsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQU5LO0lBQUEsQ0FWUCxDQUFBOztBQUFBLHVCQWtCQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsUUFBbEIsQ0FBQSxDQUE0QixDQUFDLGVBQTdCLEdBQStDLDRCQUEvQyxDQUFBOztRQUNBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7T0FEVjtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUhBLENBQUE7YUFJQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxFQUxJO0lBQUEsQ0FsQk4sQ0FBQTs7QUFBQSx1QkF5QkEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUFHLFVBQUEsS0FBQTtpREFBTSxDQUFFLE9BQVIsQ0FBQSxXQUFIO0lBQUEsQ0F6Qk4sQ0FBQTs7QUFBQSx1QkEyQkEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNULElBQUMsQ0FBQSxJQUFELENBQUEsRUFEUztJQUFBLENBM0JYLENBQUE7O0FBQUEsdUJBOEJBLFdBQUEsR0FBYSxTQUFDLElBQUQsR0FBQTtBQUNYLFVBQUEsaUJBQUE7QUFBQSxNQURhLFlBQUEsTUFBTSxtQkFBQSxXQUNuQixDQUFBO2FBQUEsRUFBQSxDQUFHLFNBQUEsR0FBQTtlQUNELElBQUMsQ0FBQSxFQUFELENBQUksQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDRixZQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxnQkFBUDthQUFMLEVBQThCLFdBQTlCLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sV0FBUDthQUFMLEVBQXlCLElBQXpCLEVBRkU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFKLEVBREM7TUFBQSxDQUFILEVBRFc7SUFBQSxDQTlCYixDQUFBOztBQUFBLHVCQW9DQSxTQUFBLEdBQVcsU0FBQyxJQUFELEdBQUE7QUFDVCxVQUFBLElBQUE7QUFBQSxNQURXLE9BQUQsS0FBQyxJQUNYLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRlM7SUFBQSxDQXBDWCxDQUFBOztvQkFBQTs7S0FEcUIsZUFKekIsQ0FBQTtBQUFBIgp9

//# sourceURL=/C:/Users/nivp/.atom/packages/git-plus/lib/views/projects-list-view.coffee
