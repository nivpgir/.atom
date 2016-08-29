(function() {
  var $, Command, Modifiers, Pane;

  Pane = require('../lib/view/command-edit-stream-pane');

  Command = require('../lib/provider/command');

  Modifiers = require('../lib/stream-modifiers/modifiers');

  $ = require('atom-space-pen-views').$;

  describe('Stream Pipe Pane', function() {
    var view;
    view = null;
    beforeEach(function() {
      Modifiers.reset();
      view = new Pane;
      return jasmine.attachToDOM(view.element);
    });
    afterEach(function() {
      return view.remove();
    });
    it('initializes the view', function() {
      return expect(view.panes).toEqual([]);
    });
    describe('on ::set with empty command', function() {
      var command;
      command = null;
      beforeEach(function() {
        spyOn(atom.contextMenu, 'add').andCallThrough();
        command = new Command;
        return view.set(command, 'stdout');
      });
      it('sets up the context menu', function() {
        return expect(atom.contextMenu.add).toHaveBeenCalledWith({
          '.stdout #add-modifier': [
            {
              label: 'Highlight All',
              command: 'build-tools:add-all'
            }, {
              label: 'Highlighting Profile',
              command: 'build-tools:add-profile'
            }, {
              label: 'Regular Expression',
              command: 'build-tools:add-regex'
            }, {
              label: 'Remove ANSI Codes',
              command: 'build-tools:add-remansi'
            }
          ]
        });
      });
      it('loads no views', function() {
        return expect(view.panes).toEqual([]);
      });
      describe('On add module', function() {
        beforeEach(function() {
          spyOn(view, 'initializePane');
          view.addModifier('all');
          return view.addModifier('remansi');
        });
        it('adds the module\'s pane', function() {
          expect(view.panes[0].key).toBe('all');
          expect(view.panes[0].view.get).toBeDefined();
          expect(view.panes[1].key).toBe('remansi');
          expect(view.panes[1].view.get).toBeDefined();
          return expect(view.panes_view[0].children.length).toBe(2);
        });
        return it('initializes the module', function() {
          var args;
          args = view.initializePane.calls[0].args;
          expect(args[0]).toBe(view.panes[0].view);
          expect(args[1]).toBeUndefined();
          args = view.initializePane.calls[1].args;
          expect(args[0]).toBe(view.panes[1].view);
          return expect(args[1]).toBeUndefined();
        });
      });
      describe('On remove module', function() {
        beforeEach(function() {
          view.addModifier('all');
          view.addModifier('remansi');
          return view.removeModifier(1);
        });
        it('removes the module pane', function() {
          return expect(view.panes_view[0].children.length).toBe(1);
        });
        return it('removes the module data', function() {
          expect(view.panes.length).toBe(1);
          return expect(view.panes[0].key).toBe('all');
        });
      });
      return describe('On move', function() {
        beforeEach(function() {
          view.addModifier('all');
          return view.addModifier('remansi');
        });
        it('moves the modifier up', function() {
          view.moveModifierUp(1);
          expect(view.panes[0].key).toBe('remansi');
          expect(view.panes[1].key).toBe('all');
          return expect(view.panes_view.children()[0]).toBe(view.panes[0].pane[0]);
        });
        return it('moves the modifier down', function() {
          view.moveModifierDown(0);
          expect(view.panes[0].key).toBe('remansi');
          expect(view.panes[1].key).toBe('all');
          return expect(view.panes_view.children()[1]).toBe(view.panes[1].pane[0]);
        });
      });
    });
    return describe('on ::set with defined command', function() {
      var command, disp, mod, module;
      command = null;
      module = null;
      mod = null;
      disp = null;
      beforeEach(function() {
        var TestSaver;
        module = {
          name: 'Test Module',
          edit: TestSaver = (function() {
            function TestSaver() {
              this.get = jasmine.createSpy('get').andCallFake(function(c) {
                c.stdout.pipeline.push({
                  name: 'testmodule',
                  config: {
                    a: 2
                  }
                });
                return null;
              });
              this.set = jasmine.createSpy('set');
              this.destroy = jasmine.createSpy('destroy');
              mod = this;
            }

            return TestSaver;

          })()
        };
        disp = Modifiers.addModule('testmodule', module);
        command = new Command;
        command.oldname = 'foo';
        command.stdout.pipeline.push({
          name: 'testmodule',
          config: {
            a: 1
          }
        });
        return view.set(command, 'stdout');
      });
      afterEach(function() {
        return disp.dispose();
      });
      it('adds one modifier', function() {
        return expect(mod.set).toHaveBeenCalledWith(command, command.stdout.pipeline[0].config, 'stdout', void 0);
      });
      it('adds the view', function() {
        expect(view.panes[0].key).toBe('testmodule');
        return expect(view.panes_view.children()[0]).toBe(view.panes[0].pane[0]);
      });
      describe('on ::get', function() {
        var command2, ret;
        command2 = null;
        ret = null;
        beforeEach(function() {
          command2 = new Command;
          return ret = view.get(command2, 'stdout');
        });
        it('calls ::get of modifier', function() {
          return expect(mod.get).toHaveBeenCalledWith(command2, 'stdout');
        });
        it('sets the new command', function() {
          return expect(command2.stdout.pipeline[0]).toEqual({
            name: 'testmodule',
            config: {
              a: 2
            }
          });
        });
        return it('returns nothing', function() {
          return expect(ret).toBeNull();
        });
      });
      return describe('on destroy', function() {
        beforeEach(function() {
          return view.remove();
        });
        it('removes all panes', function() {
          return expect(view.panes_view[0].children.length).toBe(0);
        });
        return it('calls ::destroy of all modifiers', function() {
          return expect(mod.destroy).toHaveBeenCalled();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbml2Ly5hdG9tL3BhY2thZ2VzL2J1aWxkLXRvb2xzL3NwZWMvY29tbWFuZC1lZGl0LXN0cmVhbS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsc0NBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSx5QkFBUixDQURWLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksT0FBQSxDQUFRLG1DQUFSLENBRlosQ0FBQTs7QUFBQSxFQUlDLElBQUssT0FBQSxDQUFRLHNCQUFSLEVBQUwsQ0FKRCxDQUFBOztBQUFBLEVBTUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLFNBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sR0FBQSxDQUFBLElBRFAsQ0FBQTthQUVBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUksQ0FBQyxPQUF6QixFQUhTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQU9BLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixJQUFJLENBQUMsTUFBTCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUEEsQ0FBQTtBQUFBLElBVUEsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUEsR0FBQTthQUN6QixNQUFBLENBQU8sSUFBSSxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixFQUEzQixFQUR5QjtJQUFBLENBQTNCLENBVkEsQ0FBQTtBQUFBLElBYUEsUUFBQSxDQUFTLDZCQUFULEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFBQSxNQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsV0FBWCxFQUF3QixLQUF4QixDQUE4QixDQUFDLGNBQS9CLENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsR0FBQSxDQUFBLE9BRFYsQ0FBQTtlQUVBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxFQUFrQixRQUFsQixFQUhTO01BQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxNQU9BLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7ZUFDN0IsTUFBQSxDQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBeEIsQ0FBNEIsQ0FBQyxvQkFBN0IsQ0FDRTtBQUFBLFVBQUEsdUJBQUEsRUFBeUI7WUFDdkI7QUFBQSxjQUFDLEtBQUEsRUFBTyxlQUFSO0FBQUEsY0FBeUIsT0FBQSxFQUFTLHFCQUFsQzthQUR1QixFQUV2QjtBQUFBLGNBQUMsS0FBQSxFQUFPLHNCQUFSO0FBQUEsY0FBZ0MsT0FBQSxFQUFTLHlCQUF6QzthQUZ1QixFQUd2QjtBQUFBLGNBQUMsS0FBQSxFQUFPLG9CQUFSO0FBQUEsY0FBOEIsT0FBQSxFQUFTLHVCQUF2QzthQUh1QixFQUl2QjtBQUFBLGNBQUMsS0FBQSxFQUFPLG1CQUFSO0FBQUEsY0FBNkIsT0FBQSxFQUFTLHlCQUF0QzthQUp1QjtXQUF6QjtTQURGLEVBRDZCO01BQUEsQ0FBL0IsQ0FQQSxDQUFBO0FBQUEsTUFnQkEsRUFBQSxDQUFHLGdCQUFILEVBQXFCLFNBQUEsR0FBQTtlQUNuQixNQUFBLENBQU8sSUFBSSxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixFQUEzQixFQURtQjtNQUFBLENBQXJCLENBaEJBLENBQUE7QUFBQSxNQW1CQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFFeEIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxLQUFBLENBQU0sSUFBTixFQUFZLGdCQUFaLENBQUEsQ0FBQTtBQUFBLFVBQ0EsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakIsQ0FEQSxDQUFBO2lCQUVBLElBQUksQ0FBQyxXQUFMLENBQWlCLFNBQWpCLEVBSFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBS0EsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixVQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQXJCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsS0FBL0IsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFJLENBQUMsR0FBMUIsQ0FBOEIsQ0FBQyxXQUEvQixDQUFBLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBckIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixTQUEvQixDQUZBLENBQUE7QUFBQSxVQUdBLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUksQ0FBQyxHQUExQixDQUE4QixDQUFDLFdBQS9CLENBQUEsQ0FIQSxDQUFBO2lCQUlBLE1BQUEsQ0FBTyxJQUFJLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVEsQ0FBQyxNQUFuQyxDQUEwQyxDQUFDLElBQTNDLENBQWdELENBQWhELEVBTDRCO1FBQUEsQ0FBOUIsQ0FMQSxDQUFBO2VBWUEsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTtBQUMzQixjQUFBLElBQUE7QUFBQSxVQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFwQyxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sSUFBSyxDQUFBLENBQUEsQ0FBWixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFuQyxDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxJQUFLLENBQUEsQ0FBQSxDQUFaLENBQWUsQ0FBQyxhQUFoQixDQUFBLENBRkEsQ0FBQTtBQUFBLFVBR0EsSUFBQSxHQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBSHBDLENBQUE7QUFBQSxVQUlBLE1BQUEsQ0FBTyxJQUFLLENBQUEsQ0FBQSxDQUFaLENBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFJLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQW5DLENBSkEsQ0FBQTtpQkFLQSxNQUFBLENBQU8sSUFBSyxDQUFBLENBQUEsQ0FBWixDQUFlLENBQUMsYUFBaEIsQ0FBQSxFQU4yQjtRQUFBLENBQTdCLEVBZHdCO01BQUEsQ0FBMUIsQ0FuQkEsQ0FBQTtBQUFBLE1BeUNBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFFM0IsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFJLENBQUMsV0FBTCxDQUFpQixLQUFqQixDQUFBLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLFNBQWpCLENBREEsQ0FBQTtpQkFFQSxJQUFJLENBQUMsY0FBTCxDQUFvQixDQUFwQixFQUhTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUtBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7aUJBQzVCLE1BQUEsQ0FBTyxJQUFJLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVEsQ0FBQyxNQUFuQyxDQUEwQyxDQUFDLElBQTNDLENBQWdELENBQWhELEVBRDRCO1FBQUEsQ0FBOUIsQ0FMQSxDQUFBO2VBUUEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixVQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQWxCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsQ0FBL0IsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQXJCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsS0FBL0IsRUFGNEI7UUFBQSxDQUE5QixFQVYyQjtNQUFBLENBQTdCLENBekNBLENBQUE7YUF1REEsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQSxHQUFBO0FBRWxCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakIsQ0FBQSxDQUFBO2lCQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLFNBQWpCLEVBRlM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBSUEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUEsR0FBQTtBQUMxQixVQUFBLElBQUksQ0FBQyxjQUFMLENBQW9CLENBQXBCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBckIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixTQUEvQixDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQXJCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsS0FBL0IsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQWhCLENBQUEsQ0FBMkIsQ0FBQSxDQUFBLENBQWxDLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUE5RCxFQUowQjtRQUFBLENBQTVCLENBSkEsQ0FBQTtlQVVBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsVUFBQSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsQ0FBdEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxHQUFyQixDQUF5QixDQUFDLElBQTFCLENBQStCLFNBQS9CLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBckIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixLQUEvQixDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBaEIsQ0FBQSxDQUEyQixDQUFBLENBQUEsQ0FBbEMsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEyQyxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQTlELEVBSjRCO1FBQUEsQ0FBOUIsRUFaa0I7TUFBQSxDQUFwQixFQXhEc0M7SUFBQSxDQUF4QyxDQWJBLENBQUE7V0F1RkEsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxVQUFBLDBCQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBVixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFEVCxDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQU0sSUFGTixDQUFBO0FBQUEsTUFHQSxJQUFBLEdBQU8sSUFIUCxDQUFBO0FBQUEsTUFLQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsWUFBQSxTQUFBO0FBQUEsUUFBQSxNQUFBLEdBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxhQUFOO0FBQUEsVUFDQSxJQUFBLEVBQ1E7QUFDUyxZQUFBLG1CQUFBLEdBQUE7QUFDWCxjQUFBLElBQUMsQ0FBQSxHQUFELEdBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsS0FBbEIsQ0FBd0IsQ0FBQyxXQUF6QixDQUFxQyxTQUFDLENBQUQsR0FBQTtBQUMxQyxnQkFBQSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFsQixDQUNFO0FBQUEsa0JBQUEsSUFBQSxFQUFNLFlBQU47QUFBQSxrQkFDQSxNQUFBLEVBQ0U7QUFBQSxvQkFBQSxDQUFBLEVBQUcsQ0FBSDttQkFGRjtpQkFERixDQUFBLENBQUE7dUJBSUEsS0FMMEM7Y0FBQSxDQUFyQyxDQUFQLENBQUE7QUFBQSxjQU1BLElBQUMsQ0FBQSxHQUFELEdBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsS0FBbEIsQ0FOUCxDQUFBO0FBQUEsY0FPQSxJQUFDLENBQUEsT0FBRCxHQUFXLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFNBQWxCLENBUFgsQ0FBQTtBQUFBLGNBUUEsR0FBQSxHQUFNLElBUk4sQ0FEVztZQUFBLENBQWI7OzZCQUFBOztjQUhKO1NBREYsQ0FBQTtBQUFBLFFBY0EsSUFBQSxHQUFPLFNBQVMsQ0FBQyxTQUFWLENBQW9CLFlBQXBCLEVBQWtDLE1BQWxDLENBZFAsQ0FBQTtBQUFBLFFBZUEsT0FBQSxHQUFVLEdBQUEsQ0FBQSxPQWZWLENBQUE7QUFBQSxRQWdCQSxPQUFPLENBQUMsT0FBUixHQUFrQixLQWhCbEIsQ0FBQTtBQUFBLFFBaUJBLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQXhCLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxZQUFOO0FBQUEsVUFDQSxNQUFBLEVBQ0U7QUFBQSxZQUFBLENBQUEsRUFBRyxDQUFIO1dBRkY7U0FERixDQWpCQSxDQUFBO2VBcUJBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxFQUFrQixRQUFsQixFQXRCUztNQUFBLENBQVgsQ0FMQSxDQUFBO0FBQUEsTUE2QkEsU0FBQSxDQUFVLFNBQUEsR0FBQTtlQUNSLElBQUksQ0FBQyxPQUFMLENBQUEsRUFEUTtNQUFBLENBQVYsQ0E3QkEsQ0FBQTtBQUFBLE1BZ0NBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBLEdBQUE7ZUFDdEIsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsT0FBckMsRUFBOEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBekUsRUFBaUYsUUFBakYsRUFBMkYsTUFBM0YsRUFEc0I7TUFBQSxDQUF4QixDQWhDQSxDQUFBO0FBQUEsTUFtQ0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFFBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBckIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixZQUEvQixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFoQixDQUFBLENBQTJCLENBQUEsQ0FBQSxDQUFsQyxDQUFxQyxDQUFDLElBQXRDLENBQTJDLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBOUQsRUFGa0I7TUFBQSxDQUFwQixDQW5DQSxDQUFBO0FBQUEsTUF1Q0EsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFlBQUEsYUFBQTtBQUFBLFFBQUEsUUFBQSxHQUFXLElBQVgsQ0FBQTtBQUFBLFFBQ0EsR0FBQSxHQUFNLElBRE4sQ0FBQTtBQUFBLFFBR0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsUUFBQSxHQUFXLEdBQUEsQ0FBQSxPQUFYLENBQUE7aUJBQ0EsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsUUFBVCxFQUFtQixRQUFuQixFQUZHO1FBQUEsQ0FBWCxDQUhBLENBQUE7QUFBQSxRQU9BLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7aUJBQzVCLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLFFBQXJDLEVBQStDLFFBQS9DLEVBRDRCO1FBQUEsQ0FBOUIsQ0FQQSxDQUFBO0FBQUEsUUFVQSxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO2lCQUN6QixNQUFBLENBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFoQyxDQUFtQyxDQUFDLE9BQXBDLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxZQUFOO0FBQUEsWUFDQSxNQUFBLEVBQ0U7QUFBQSxjQUFBLENBQUEsRUFBRyxDQUFIO2FBRkY7V0FERixFQUR5QjtRQUFBLENBQTNCLENBVkEsQ0FBQTtlQWdCQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQSxHQUFBO2lCQUNwQixNQUFBLENBQU8sR0FBUCxDQUFXLENBQUMsUUFBWixDQUFBLEVBRG9CO1FBQUEsQ0FBdEIsRUFqQm1CO01BQUEsQ0FBckIsQ0F2Q0EsQ0FBQTthQTJEQSxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBLEdBQUE7QUFFckIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULElBQUksQ0FBQyxNQUFMLENBQUEsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQSxHQUFBO2lCQUN0QixNQUFBLENBQU8sSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFRLENBQUMsTUFBbkMsQ0FBMEMsQ0FBQyxJQUEzQyxDQUFnRCxDQUFoRCxFQURzQjtRQUFBLENBQXhCLENBSEEsQ0FBQTtlQU1BLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBLEdBQUE7aUJBQ3JDLE1BQUEsQ0FBTyxHQUFHLENBQUMsT0FBWCxDQUFtQixDQUFDLGdCQUFwQixDQUFBLEVBRHFDO1FBQUEsQ0FBdkMsRUFScUI7TUFBQSxDQUF2QixFQTVEd0M7SUFBQSxDQUExQyxFQXhGMkI7RUFBQSxDQUE3QixDQU5BLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/niv/.atom/packages/build-tools/spec/command-edit-stream-spec.coffee
