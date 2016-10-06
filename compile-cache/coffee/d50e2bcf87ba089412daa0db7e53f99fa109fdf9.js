(function() {
  var GitCommitAmend, Path, commitFilePath, commitPane, currentPane, fs, git, pathToRepoFile, repo, textEditor, _ref;

  fs = require('fs-plus');

  Path = require('flavored-path');

  git = require('../../lib/git');

  GitCommitAmend = require('../../lib/models/git-commit-amend');

  _ref = require('../fixtures'), repo = _ref.repo, pathToRepoFile = _ref.pathToRepoFile, textEditor = _ref.textEditor, commitPane = _ref.commitPane, currentPane = _ref.currentPane;

  commitFilePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');

  describe("GitCommitAmend", function() {
    beforeEach(function() {
      spyOn(atom.workspace, 'getActivePane').andReturn(currentPane);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(atom.workspace, 'getPanes').andReturn([currentPane, commitPane]);
      spyOn(atom.workspace, 'paneForURI').andReturn(commitPane);
      spyOn(git, 'refresh');
      spyOn(commitPane, 'destroy').andCallThrough();
      spyOn(currentPane, 'activate');
      spyOn(fs, 'unlink');
      spyOn(fs, 'readFileSync').andReturn('');
      spyOn(git, 'stagedFiles').andCallFake(function() {
        var args;
        args = git.stagedFiles.mostRecentCall.args;
        if (args[0].getWorkingDirectory() === repo.getWorkingDirectory()) {
          return Promise.resolve([pathToRepoFile]);
        }
      });
      return spyOn(git, 'cmd').andCallFake(function() {
        var args;
        args = git.cmd.mostRecentCall.args[0];
        switch (args[0]) {
          case 'whatchanged':
            return Promise.resolve('last commit');
          case 'status':
            return Promise.resolve('current status');
          default:
            return Promise.resolve('');
        }
      });
    });
    it("gets the previous commit message and changed files", function() {
      var expectedGitArgs;
      expectedGitArgs = ['whatchanged', '-1', '--name-status', '--format=%B'];
      GitCommitAmend(repo);
      return expect(git.cmd).toHaveBeenCalledWith(expectedGitArgs, {
        cwd: repo.getWorkingDirectory()
      });
    });
    it("writes to the new commit file", function() {
      spyOn(fs, 'writeFileSync');
      GitCommitAmend(repo);
      waitsFor(function() {
        return fs.writeFileSync.callCount > 0;
      });
      return runs(function() {
        var actualPath;
        actualPath = fs.writeFileSync.mostRecentCall.args[0];
        return expect(actualPath).toEqual(commitFilePath);
      });
    });
    it("shows the file", function() {
      GitCommitAmend(repo);
      waitsFor(function() {
        return atom.workspace.open.callCount > 0;
      });
      return runs(function() {
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
    });
    it("calls git.cmd with ['commit'...] on textEditor save", function() {
      GitCommitAmend(repo);
      textEditor.save();
      return expect(git.cmd).toHaveBeenCalledWith(['commit', '--amend', '--cleanup=strip', "--file=" + commitFilePath], {
        cwd: repo.getWorkingDirectory()
      });
    });
    it("closes the commit pane when commit is successful", function() {
      GitCommitAmend(repo);
      textEditor.save();
      waitsFor(function() {
        return commitPane.destroy.callCount > 0;
      });
      return runs(function() {
        return expect(commitPane.destroy).toHaveBeenCalled();
      });
    });
    return it("cancels the commit on textEditor destroy", function() {
      GitCommitAmend(repo);
      textEditor.destroy();
      expect(currentPane.activate).toHaveBeenCalled();
      return expect(fs.unlink).toHaveBeenCalledWith(commitFilePath);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbml2Ly5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1jb21taXQtYW1lbmQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEdBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUixDQUhOLENBQUE7O0FBQUEsRUFJQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQ0FBUixDQUpqQixDQUFBOztBQUFBLEVBS0EsT0FNSSxPQUFBLENBQVEsYUFBUixDQU5KLEVBQ0UsWUFBQSxJQURGLEVBRUUsc0JBQUEsY0FGRixFQUdFLGtCQUFBLFVBSEYsRUFJRSxrQkFBQSxVQUpGLEVBS0UsbUJBQUEsV0FWRixDQUFBOztBQUFBLEVBYUEsY0FBQSxHQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBVixFQUEwQixnQkFBMUIsQ0FiakIsQ0FBQTs7QUFBQSxFQWVBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsZUFBdEIsQ0FBc0MsQ0FBQyxTQUF2QyxDQUFpRCxXQUFqRCxDQUFBLENBQUE7QUFBQSxNQUNBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixNQUF0QixDQUE2QixDQUFDLFNBQTlCLENBQXdDLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFVBQWhCLENBQXhDLENBREEsQ0FBQTtBQUFBLE1BRUEsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLFVBQXRCLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsQ0FBQyxXQUFELEVBQWMsVUFBZCxDQUE1QyxDQUZBLENBQUE7QUFBQSxNQUdBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixZQUF0QixDQUFtQyxDQUFDLFNBQXBDLENBQThDLFVBQTlDLENBSEEsQ0FBQTtBQUFBLE1BSUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxTQUFYLENBSkEsQ0FBQTtBQUFBLE1BTUEsS0FBQSxDQUFNLFVBQU4sRUFBa0IsU0FBbEIsQ0FBNEIsQ0FBQyxjQUE3QixDQUFBLENBTkEsQ0FBQTtBQUFBLE1BT0EsS0FBQSxDQUFNLFdBQU4sRUFBbUIsVUFBbkIsQ0FQQSxDQUFBO0FBQUEsTUFTQSxLQUFBLENBQU0sRUFBTixFQUFVLFFBQVYsQ0FUQSxDQUFBO0FBQUEsTUFVQSxLQUFBLENBQU0sRUFBTixFQUFVLGNBQVYsQ0FBeUIsQ0FBQyxTQUExQixDQUFvQyxFQUFwQyxDQVZBLENBQUE7QUFBQSxNQVdBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsYUFBWCxDQUF5QixDQUFDLFdBQTFCLENBQXNDLFNBQUEsR0FBQTtBQUNwQyxZQUFBLElBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUF0QyxDQUFBO0FBQ0EsUUFBQSxJQUFHLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxtQkFBUixDQUFBLENBQUEsS0FBaUMsSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBcEM7aUJBQ0UsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsQ0FBQyxjQUFELENBQWhCLEVBREY7U0FGb0M7TUFBQSxDQUF0QyxDQVhBLENBQUE7YUFnQkEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsV0FBbEIsQ0FBOEIsU0FBQSxHQUFBO0FBQzVCLFlBQUEsSUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQW5DLENBQUE7QUFDQSxnQkFBTyxJQUFLLENBQUEsQ0FBQSxDQUFaO0FBQUEsZUFDTyxhQURQO21CQUMwQixPQUFPLENBQUMsT0FBUixDQUFnQixhQUFoQixFQUQxQjtBQUFBLGVBRU8sUUFGUDttQkFFcUIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsZ0JBQWhCLEVBRnJCO0FBQUE7bUJBR08sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsRUFIUDtBQUFBLFNBRjRCO01BQUEsQ0FBOUIsRUFqQlM7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBd0JBLEVBQUEsQ0FBRyxvREFBSCxFQUF5RCxTQUFBLEdBQUE7QUFDdkQsVUFBQSxlQUFBO0FBQUEsTUFBQSxlQUFBLEdBQWtCLENBQUMsYUFBRCxFQUFnQixJQUFoQixFQUFzQixlQUF0QixFQUF1QyxhQUF2QyxDQUFsQixDQUFBO0FBQUEsTUFDQSxjQUFBLENBQWUsSUFBZixDQURBLENBQUE7YUFFQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxlQUFyQyxFQUFzRDtBQUFBLFFBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBdEQsRUFIdUQ7SUFBQSxDQUF6RCxDQXhCQSxDQUFBO0FBQUEsSUE2QkEsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxNQUFBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsZUFBVixDQUFBLENBQUE7QUFBQSxNQUNBLGNBQUEsQ0FBZSxJQUFmLENBREEsQ0FBQTtBQUFBLE1BRUEsUUFBQSxDQUFTLFNBQUEsR0FBQTtlQUNQLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBakIsR0FBNkIsRUFEdEI7TUFBQSxDQUFULENBRkEsQ0FBQTthQUlBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxZQUFBLFVBQUE7QUFBQSxRQUFBLFVBQUEsR0FBYSxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFsRCxDQUFBO2VBQ0EsTUFBQSxDQUFPLFVBQVAsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixjQUEzQixFQUZHO01BQUEsQ0FBTCxFQUxrQztJQUFBLENBQXBDLENBN0JBLENBQUE7QUFBQSxJQXNDQSxFQUFBLENBQUcsZ0JBQUgsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLE1BQUEsY0FBQSxDQUFlLElBQWYsQ0FBQSxDQUFBO0FBQUEsTUFDQSxRQUFBLENBQVMsU0FBQSxHQUFBO2VBQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBcEIsR0FBZ0MsRUFEekI7TUFBQSxDQUFULENBREEsQ0FBQTthQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7ZUFDSCxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUF0QixDQUEyQixDQUFDLGdCQUE1QixDQUFBLEVBREc7TUFBQSxDQUFMLEVBSm1CO0lBQUEsQ0FBckIsQ0F0Q0EsQ0FBQTtBQUFBLElBNkNBLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsTUFBQSxjQUFBLENBQWUsSUFBZixDQUFBLENBQUE7QUFBQSxNQUNBLFVBQVUsQ0FBQyxJQUFYLENBQUEsQ0FEQSxDQUFBO2FBRUEsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxRQUFELEVBQVcsU0FBWCxFQUFzQixpQkFBdEIsRUFBMEMsU0FBQSxHQUFTLGNBQW5ELENBQXJDLEVBQTJHO0FBQUEsUUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUEzRyxFQUh3RDtJQUFBLENBQTFELENBN0NBLENBQUE7QUFBQSxJQWtEQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQSxHQUFBO0FBQ3JELE1BQUEsY0FBQSxDQUFlLElBQWYsQ0FBQSxDQUFBO0FBQUEsTUFDQSxVQUFVLENBQUMsSUFBWCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsUUFBQSxDQUFTLFNBQUEsR0FBQTtlQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBbkIsR0FBK0IsRUFBbEM7TUFBQSxDQUFULENBRkEsQ0FBQTthQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQU8sVUFBVSxDQUFDLE9BQWxCLENBQTBCLENBQUMsZ0JBQTNCLENBQUEsRUFBSDtNQUFBLENBQUwsRUFKcUQ7SUFBQSxDQUF2RCxDQWxEQSxDQUFBO1dBd0RBLEVBQUEsQ0FBRywwQ0FBSCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsTUFBQSxjQUFBLENBQWUsSUFBZixDQUFBLENBQUE7QUFBQSxNQUNBLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sV0FBVyxDQUFDLFFBQW5CLENBQTRCLENBQUMsZ0JBQTdCLENBQUEsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLEVBQUUsQ0FBQyxNQUFWLENBQWlCLENBQUMsb0JBQWxCLENBQXVDLGNBQXZDLEVBSjZDO0lBQUEsQ0FBL0MsRUF6RHlCO0VBQUEsQ0FBM0IsQ0FmQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/niv/.atom/packages/git-plus/spec/models/git-commit-amend-spec.coffee
