(function() {
  var CommandEditMainPane;

  CommandEditMainPane = require('../lib/view/command-edit-main-pane');

  describe('Command Edit Main Pane', function() {
    var view;
    view = null;
    beforeEach(function() {
      return view = new CommandEditMainPane;
    });
    afterEach(function() {
      return typeof view.destroy === "function" ? view.destroy() : void 0;
    });
    it('has a pane', function() {
      return expect(view.element).toBeDefined();
    });
    describe('On set with a value', function() {
      beforeEach(function() {
        return view.set({
          name: 'Test',
          command: 'echo test',
          wd: '.',
          shell: true,
          wildcards: false
        });
      });
      return it('sets the fields accordingly', function() {
        expect(view.command_name.getModel().getText()).toBe('Test');
        expect(view.command_text.getModel().getText()).toBe('echo test');
        return expect(view.working_directory.getModel().getText()).toBe('.');
      });
    });
    describe('On set without a value', function() {
      beforeEach(function() {
        return view.set();
      });
      return it('sets the fields to their default values', function() {
        expect(view.command_name.getModel().getText()).toBe('');
        expect(view.command_text.getModel().getText()).toBe('');
        return expect(view.working_directory.getModel().getText()).toBe('.');
      });
    });
    describe('On get with wrong values', function() {
      var c, r;
      c = {};
      r = null;
      beforeEach(function() {
        return r = view.get(c);
      });
      it('returns an error', function() {
        return expect(r).toBe('Empty Name');
      });
      return it('does not update the command', function() {
        return expect(c).toEqual({});
      });
    });
    return describe('On get with correct values', function() {
      var c, r;
      c = {};
      r = null;
      beforeEach(function() {
        view.command_name.getModel().setText('Foo');
        view.command_text.getModel().setText('Bar');
        return r = view.get(c);
      });
      it('returns null', function() {
        return expect(r).toBe(null);
      });
      return it('updates the command', function() {
        return expect(c).toEqual({
          name: 'Foo',
          command: 'Bar',
          wd: '.'
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbml2Ly5hdG9tL3BhY2thZ2VzL2J1aWxkLXRvb2xzL3NwZWMvY29tbWFuZC1lZGl0LW1haW4tcGFuZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQkFBQTs7QUFBQSxFQUFBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSxvQ0FBUixDQUF0QixDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxJQUFBLEdBQU8sR0FBQSxDQUFBLG9CQURFO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQUtBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7a0RBQ1IsSUFBSSxDQUFDLG1CQURHO0lBQUEsQ0FBVixDQUxBLENBQUE7QUFBQSxJQVFBLEVBQUEsQ0FBRyxZQUFILEVBQWlCLFNBQUEsR0FBQTthQUNmLE1BQUEsQ0FBTyxJQUFJLENBQUMsT0FBWixDQUFvQixDQUFDLFdBQXJCLENBQUEsRUFEZTtJQUFBLENBQWpCLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtBQUU5QixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxJQUFJLENBQUMsR0FBTCxDQUFTO0FBQUEsVUFDUCxJQUFBLEVBQU0sTUFEQztBQUFBLFVBRVAsT0FBQSxFQUFTLFdBRkY7QUFBQSxVQUdQLEVBQUEsRUFBSSxHQUhHO0FBQUEsVUFJUCxLQUFBLEVBQU8sSUFKQTtBQUFBLFVBS1AsU0FBQSxFQUFXLEtBTEo7U0FBVCxFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFTQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FB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

//# sourceURL=/home/niv/.atom/packages/build-tools/spec/command-edit-main-pane-spec.coffee