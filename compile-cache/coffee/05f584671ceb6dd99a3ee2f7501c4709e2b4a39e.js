(function() {
  var BufferedProcess, ClangFlags, ClangProvider, CompositeDisposable, LanguageUtil, Point, Range, existsSync, path, _ref;

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, BufferedProcess = _ref.BufferedProcess, CompositeDisposable = _ref.CompositeDisposable;

  path = require('path');

  existsSync = require('fs').existsSync;

  ClangFlags = require('clang-flags');

  module.exports = ClangProvider = (function() {
    function ClangProvider() {}

    ClangProvider.prototype.selector = '.source.cpp, .source.c, .source.objc, .source.objcpp';

    ClangProvider.prototype.inclusionPriority = 1;

    ClangProvider.prototype.scopeSource = {
      'source.cpp': 'c++',
      'source.c': 'c',
      'source.objc': 'objective-c',
      'source.objcpp': 'objective-c++'
    };

    ClangProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, language, lastSymbol, line, minimumWordLength, prefix, regex, scopeDescriptor, symbolPosition, _ref1;
      editor = _arg.editor, scopeDescriptor = _arg.scopeDescriptor, bufferPosition = _arg.bufferPosition;
      language = LanguageUtil.getSourceScopeLang(this.scopeSource, scopeDescriptor.getScopesArray());
      prefix = LanguageUtil.prefixAtPosition(editor, bufferPosition);
      _ref1 = LanguageUtil.nearestSymbolPosition(editor, bufferPosition), symbolPosition = _ref1[0], lastSymbol = _ref1[1];
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      if ((minimumWordLength != null) && prefix.length < minimumWordLength) {
        regex = /(?:\.|->|::)\s*\w*$/;
        line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        if (!regex.test(line)) {
          return;
        }
      }
      if (language != null) {
        return this.codeCompletionAt(editor, symbolPosition.row, symbolPosition.column, language, prefix);
      }
    };

    ClangProvider.prototype.codeCompletionAt = function(editor, row, column, language, prefix) {
      var args, command, options;
      command = atom.config.get("autocomplete-clang.clangCommand");
      args = this.buildClangArgs(editor, row, column, language);
      options = {
        cwd: path.dirname(editor.getPath()),
        input: editor.getText()
      };
      return new Promise((function(_this) {
        return function(resolve) {
          var allOutput, bufferedProcess, exit, stderr, stdout;
          allOutput = [];
          stdout = function(output) {
            return allOutput.push(output);
          };
          stderr = function(output) {
            return console.log(output);
          };
          exit = function(code) {
            return resolve(_this.handleCompletionResult(allOutput.join('\n'), code, prefix));
          };
          bufferedProcess = new BufferedProcess({
            command: command,
            args: args,
            options: options,
            stdout: stdout,
            stderr: stderr,
            exit: exit
          });
          bufferedProcess.process.stdin.setEncoding = 'utf-8';
          bufferedProcess.process.stdin.write(editor.getText());
          return bufferedProcess.process.stdin.end();
        };
      })(this));
    };

    ClangProvider.prototype.convertCompletionLine = function(line, prefix) {
      var argumentsRe, basicInfo, basicInfoRe, comment, commentRe, completion, completionAndComment, constMemFuncRe, content, contentRe, index, infoTagsRe, isConstMemFunc, match, returnType, returnTypeRe, suggestion, _ref1, _ref2, _ref3;
      contentRe = /^COMPLETION: (.*)/;
      _ref1 = line.match(contentRe), line = _ref1[0], content = _ref1[1];
      basicInfoRe = /^(.*?) : (.*)/;
      match = content.match(basicInfoRe);
      if (match == null) {
        return {
          text: content
        };
      }
      content = match[0], basicInfo = match[1], completionAndComment = match[2];
      commentRe = /(?: : (.*))?$/;
      _ref2 = completionAndComment.split(commentRe), completion = _ref2[0], comment = _ref2[1];
      returnTypeRe = /^\[#(.*?)#\]/;
      returnType = (_ref3 = completion.match(returnTypeRe)) != null ? _ref3[1] : void 0;
      constMemFuncRe = /\[# const#\]$/;
      isConstMemFunc = constMemFuncRe.test(completion);
      infoTagsRe = /\[#(.*?)#\]/g;
      completion = completion.replace(infoTagsRe, '');
      argumentsRe = /<#(.*?)#>/g;
      index = 0;
      completion = completion.replace(argumentsRe, function(match, arg) {
        index++;
        return "${" + index + ":" + arg + "}";
      });
      suggestion = {};
      if (returnType != null) {
        suggestion.leftLabel = returnType;
      }
      if (index > 0) {
        suggestion.snippet = completion;
      } else {
        suggestion.text = completion;
      }
      if (isConstMemFunc) {
        suggestion.displayText = completion + ' const';
      }
      if (comment != null) {
        suggestion.description = comment;
      }
      suggestion.replacementPrefix = prefix;
      return suggestion;
    };

    ClangProvider.prototype.handleCompletionResult = function(result, returnCode, prefix) {
      var completionsRe, line, outputLines;
      if (returnCode === !0) {
        if (!atom.config.get("autocomplete-clang.ignoreClangErrors")) {
          return;
        }
      }
      completionsRe = new RegExp("^COMPLETION: (" + prefix + ".*)$", "mg");
      outputLines = result.match(completionsRe);
      if (outputLines != null) {
        return (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = outputLines.length; _i < _len; _i++) {
            line = outputLines[_i];
            _results.push(this.convertCompletionLine(line, prefix));
          }
          return _results;
        }).call(this);
      } else {
        return [];
      }
    };

    ClangProvider.prototype.buildClangArgs = function(editor, row, column, language) {
      var args, clangflags, currentDir, error, i, pchFile, pchFilePrefix, pchPath, std, _i, _len, _ref1;
      std = atom.config.get("autocomplete-clang.std " + language);
      currentDir = path.dirname(editor.getPath());
      pchFilePrefix = atom.config.get("autocomplete-clang.pchFilePrefix");
      pchFile = [pchFilePrefix, language, "pch"].join('.');
      pchPath = path.join(currentDir, pchFile);
      args = ["-fsyntax-only"];
      args.push("-x" + language);
      if (std) {
        args.push("-std=" + std);
      }
      args.push("-Xclang", "-code-completion-macros");
      args.push("-Xclang", "-code-completion-at=-:" + (row + 1) + ":" + (column + 1));
      if (existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      _ref1 = atom.config.get("autocomplete-clang.includePaths");
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        i = _ref1[_i];
        args.push("-I" + i);
      }
      args.push("-I" + currentDir);
      if (atom.config.get("autocomplete-clang.includeDocumentation")) {
        args.push("-Xclang", "-code-completion-brief-comments");
        if (atom.config.get("autocomplete-clang.includeNonDoxygenCommentsAsDocumentation")) {
          args.push("-fparse-all-comments");
        }
      }
      try {
        clangflags = ClangFlags.getClangFlags(editor.getPath());
        if (clangflags) {
          args = args.concat(clangflags);
        }
      } catch (_error) {
        error = _error;
        console.log(error);
      }
      args.push("-");
      return args;
    };

    return ClangProvider;

  })();

  LanguageUtil = {
    getSourceScopeLang: function(scopeSource, scopesArray) {
      var scope, _i, _len;
      for (_i = 0, _len = scopesArray.length; _i < _len; _i++) {
        scope = scopesArray[_i];
        if (scope in scopeSource) {
          return scopeSource[scope];
        }
      }
      return null;
    },
    prefixAtPosition: function(editor, bufferPosition) {
      var line, regex, _ref1;
      regex = /\w+$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((_ref1 = line.match(regex)) != null ? _ref1[0] : void 0) || '';
    },
    nearestSymbolPosition: function(editor, bufferPosition) {
      var line, matches, regex, symbol, symbolColumn;
      regex = /(\W+)\w*$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      matches = line.match(regex);
      if (matches) {
        symbol = matches[1];
        symbolColumn = matches[0].indexOf(symbol) + symbol.length + (line.length - matches[0].length);
        return [new Point(bufferPosition.row, symbolColumn), symbol.slice(-1)];
      } else {
        return [bufferPosition, ''];
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvbml2Ly5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1jbGFuZy9saWIvY2xhbmctcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBSUE7QUFBQSxNQUFBLG1IQUFBOztBQUFBLEVBQUEsT0FBdUQsT0FBQSxDQUFRLE1BQVIsQ0FBdkQsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsRUFBZSx1QkFBQSxlQUFmLEVBQWdDLDJCQUFBLG1CQUFoQyxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGFBQWMsT0FBQSxDQUFRLElBQVIsRUFBZCxVQUZELENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGFBQVIsQ0FIYixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTsrQkFDSjs7QUFBQSw0QkFBQSxRQUFBLEdBQVUsc0RBQVYsQ0FBQTs7QUFBQSw0QkFDQSxpQkFBQSxHQUFtQixDQURuQixDQUFBOztBQUFBLDRCQUdBLFdBQUEsR0FDRTtBQUFBLE1BQUEsWUFBQSxFQUFjLEtBQWQ7QUFBQSxNQUNBLFVBQUEsRUFBWSxHQURaO0FBQUEsTUFFQSxhQUFBLEVBQWUsYUFGZjtBQUFBLE1BR0EsZUFBQSxFQUFpQixlQUhqQjtLQUpGLENBQUE7O0FBQUEsNEJBU0EsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNkLFVBQUEsNEhBQUE7QUFBQSxNQURnQixjQUFBLFFBQVEsdUJBQUEsaUJBQWlCLHNCQUFBLGNBQ3pDLENBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxZQUFZLENBQUMsa0JBQWIsQ0FBZ0MsSUFBQyxDQUFBLFdBQWpDLEVBQThDLGVBQWUsQ0FBQyxjQUFoQixDQUFBLENBQTlDLENBQVgsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLFlBQVksQ0FBQyxnQkFBYixDQUE4QixNQUE5QixFQUFzQyxjQUF0QyxDQURULENBQUE7QUFBQSxNQUVBLFFBQThCLFlBQVksQ0FBQyxxQkFBYixDQUFtQyxNQUFuQyxFQUEyQyxjQUEzQyxDQUE5QixFQUFDLHlCQUFELEVBQWdCLHFCQUZoQixDQUFBO0FBQUEsTUFHQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCLENBSHBCLENBQUE7QUFLQSxNQUFBLElBQUcsMkJBQUEsSUFBdUIsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsaUJBQTFDO0FBQ0UsUUFBQSxLQUFBLEdBQVEscUJBQVIsQ0FBQTtBQUFBLFFBQ0EsSUFBQSxHQUFPLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsQ0FBckIsQ0FBRCxFQUEwQixjQUExQixDQUF0QixDQURQLENBQUE7QUFFQSxRQUFBLElBQUEsQ0FBQSxLQUFtQixDQUFDLElBQU4sQ0FBVyxJQUFYLENBQWQ7QUFBQSxnQkFBQSxDQUFBO1NBSEY7T0FMQTtBQVVBLE1BQUEsSUFBRyxnQkFBSDtlQUNFLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFsQixFQUEwQixjQUFjLENBQUMsR0FBekMsRUFBOEMsY0FBYyxDQUFDLE1BQTdELEVBQXFFLFFBQXJFLEVBQStFLE1BQS9FLEVBREY7T0FYYztJQUFBLENBVGhCLENBQUE7O0FBQUEsNEJBdUJBLGdCQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxNQUFkLEVBQXNCLFFBQXRCLEVBQWdDLE1BQWhDLEdBQUE7QUFDaEIsVUFBQSxzQkFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBVixDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsRUFBd0IsR0FBeEIsRUFBNkIsTUFBN0IsRUFBcUMsUUFBckMsQ0FEUCxDQUFBO0FBQUEsTUFFQSxPQUFBLEdBQ0U7QUFBQSxRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBYixDQUFMO0FBQUEsUUFDQSxLQUFBLEVBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQURQO09BSEYsQ0FBQTthQU1JLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUNWLGNBQUEsZ0RBQUE7QUFBQSxVQUFBLFNBQUEsR0FBWSxFQUFaLENBQUE7QUFBQSxVQUNBLE1BQUEsR0FBUyxTQUFDLE1BQUQsR0FBQTttQkFBWSxTQUFTLENBQUMsSUFBVixDQUFlLE1BQWYsRUFBWjtVQUFBLENBRFQsQ0FBQTtBQUFBLFVBRUEsTUFBQSxHQUFTLFNBQUMsTUFBRCxHQUFBO21CQUFZLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixFQUFaO1VBQUEsQ0FGVCxDQUFBO0FBQUEsVUFHQSxJQUFBLEdBQU8sU0FBQyxJQUFELEdBQUE7bUJBQVUsT0FBQSxDQUFRLEtBQUMsQ0FBQSxzQkFBRCxDQUF3QixTQUFTLENBQUMsSUFBVixDQUFlLElBQWYsQ0FBeEIsRUFBOEMsSUFBOUMsRUFBb0QsTUFBcEQsQ0FBUixFQUFWO1VBQUEsQ0FIUCxDQUFBO0FBQUEsVUFJQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQjtBQUFBLFlBQUMsU0FBQSxPQUFEO0FBQUEsWUFBVSxNQUFBLElBQVY7QUFBQSxZQUFnQixTQUFBLE9BQWhCO0FBQUEsWUFBeUIsUUFBQSxNQUF6QjtBQUFBLFlBQWlDLFFBQUEsTUFBakM7QUFBQSxZQUF5QyxNQUFBLElBQXpDO1dBQWhCLENBSnRCLENBQUE7QUFBQSxVQUtBLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQTlCLEdBQTRDLE9BTDVDLENBQUE7QUFBQSxVQU1BLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQTlCLENBQW9DLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBcEMsQ0FOQSxDQUFBO2lCQU9BLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQTlCLENBQUEsRUFSVTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsRUFQWTtJQUFBLENBdkJsQixDQUFBOztBQUFBLDRCQXdDQSxxQkFBQSxHQUF1QixTQUFDLElBQUQsRUFBTyxNQUFQLEdBQUE7QUFDckIsVUFBQSxrT0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLG1CQUFaLENBQUE7QUFBQSxNQUNBLFFBQWtCLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxDQUFsQixFQUFDLGVBQUQsRUFBTyxrQkFEUCxDQUFBO0FBQUEsTUFFQSxXQUFBLEdBQWMsZUFGZCxDQUFBO0FBQUEsTUFHQSxLQUFBLEdBQVEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxXQUFkLENBSFIsQ0FBQTtBQUlBLE1BQUEsSUFBOEIsYUFBOUI7QUFBQSxlQUFPO0FBQUEsVUFBQyxJQUFBLEVBQU0sT0FBUDtTQUFQLENBQUE7T0FKQTtBQUFBLE1BTUMsa0JBQUQsRUFBVSxvQkFBVixFQUFxQiwrQkFOckIsQ0FBQTtBQUFBLE1BT0EsU0FBQSxHQUFZLGVBUFosQ0FBQTtBQUFBLE1BUUEsUUFBd0Isb0JBQW9CLENBQUMsS0FBckIsQ0FBMkIsU0FBM0IsQ0FBeEIsRUFBQyxxQkFBRCxFQUFhLGtCQVJiLENBQUE7QUFBQSxNQVNBLFlBQUEsR0FBZSxjQVRmLENBQUE7QUFBQSxNQVVBLFVBQUEsMkRBQTZDLENBQUEsQ0FBQSxVQVY3QyxDQUFBO0FBQUEsTUFXQSxjQUFBLEdBQWlCLGVBWGpCLENBQUE7QUFBQSxNQVlBLGNBQUEsR0FBaUIsY0FBYyxDQUFDLElBQWYsQ0FBb0IsVUFBcEIsQ0FaakIsQ0FBQTtBQUFBLE1BYUEsVUFBQSxHQUFhLGNBYmIsQ0FBQTtBQUFBLE1BY0EsVUFBQSxHQUFhLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFVBQW5CLEVBQStCLEVBQS9CLENBZGIsQ0FBQTtBQUFBLE1BZUEsV0FBQSxHQUFjLFlBZmQsQ0FBQTtBQUFBLE1BZ0JBLEtBQUEsR0FBUSxDQWhCUixDQUFBO0FBQUEsTUFpQkEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFdBQW5CLEVBQWdDLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUMzQyxRQUFBLEtBQUEsRUFBQSxDQUFBO2VBQ0MsSUFBQSxHQUFJLEtBQUosR0FBVSxHQUFWLEdBQWEsR0FBYixHQUFpQixJQUZ5QjtNQUFBLENBQWhDLENBakJiLENBQUE7QUFBQSxNQXFCQSxVQUFBLEdBQWEsRUFyQmIsQ0FBQTtBQXNCQSxNQUFBLElBQXFDLGtCQUFyQztBQUFBLFFBQUEsVUFBVSxDQUFDLFNBQVgsR0FBdUIsVUFBdkIsQ0FBQTtPQXRCQTtBQXVCQSxNQUFBLElBQUcsS0FBQSxHQUFRLENBQVg7QUFDRSxRQUFBLFVBQVUsQ0FBQyxPQUFYLEdBQXFCLFVBQXJCLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxVQUFVLENBQUMsSUFBWCxHQUFrQixVQUFsQixDQUhGO09BdkJBO0FBMkJBLE1BQUEsSUFBRyxjQUFIO0FBQ0UsUUFBQSxVQUFVLENBQUMsV0FBWCxHQUF5QixVQUFBLEdBQWEsUUFBdEMsQ0FERjtPQTNCQTtBQTZCQSxNQUFBLElBQW9DLGVBQXBDO0FBQUEsUUFBQSxVQUFVLENBQUMsV0FBWCxHQUF5QixPQUF6QixDQUFBO09BN0JBO0FBQUEsTUE4QkEsVUFBVSxDQUFDLGlCQUFYLEdBQStCLE1BOUIvQixDQUFBO2FBK0JBLFdBaENxQjtJQUFBLENBeEN2QixDQUFBOztBQUFBLDRCQTBFQSxzQkFBQSxHQUF3QixTQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLE1BQXJCLEdBQUE7QUFDdEIsVUFBQSxnQ0FBQTtBQUFBLE1BQUEsSUFBRyxVQUFBLEtBQWMsQ0FBQSxDQUFqQjtBQUNFLFFBQUEsSUFBQSxDQUFBLElBQWtCLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0NBQWhCLENBQWQ7QUFBQSxnQkFBQSxDQUFBO1NBREY7T0FBQTtBQUFBLE1BSUEsYUFBQSxHQUFvQixJQUFBLE1BQUEsQ0FBTyxnQkFBQSxHQUFtQixNQUFuQixHQUE0QixNQUFuQyxFQUEyQyxJQUEzQyxDQUpwQixDQUFBO0FBQUEsTUFLQSxXQUFBLEdBQWMsTUFBTSxDQUFDLEtBQVAsQ0FBYSxhQUFiLENBTGQsQ0FBQTtBQU9BLE1BQUEsSUFBRyxtQkFBSDtBQUNJOztBQUFRO2VBQUEsa0RBQUE7bUNBQUE7QUFBQSwwQkFBQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsSUFBdkIsRUFBNkIsTUFBN0IsRUFBQSxDQUFBO0FBQUE7O3FCQUFSLENBREo7T0FBQSxNQUFBO0FBR0ksZUFBTyxFQUFQLENBSEo7T0FSc0I7SUFBQSxDQTFFeEIsQ0FBQTs7QUFBQSw0QkF1RkEsY0FBQSxHQUFnQixTQUFDLE1BQUQsRUFBUyxHQUFULEVBQWMsTUFBZCxFQUFzQixRQUF0QixHQUFBO0FBQ2QsVUFBQSw2RkFBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFpQix5QkFBQSxHQUF5QixRQUExQyxDQUFOLENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBYixDQURiLENBQUE7QUFBQSxNQUVBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixDQUZoQixDQUFBO0FBQUEsTUFHQSxPQUFBLEdBQVUsQ0FBQyxhQUFELEVBQWdCLFFBQWhCLEVBQTBCLEtBQTFCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsR0FBdEMsQ0FIVixDQUFBO0FBQUEsTUFJQSxPQUFBLEdBQVUsSUFBSSxDQUFDLElBQUwsQ0FBVSxVQUFWLEVBQXNCLE9BQXRCLENBSlYsQ0FBQTtBQUFBLE1BTUEsSUFBQSxHQUFPLENBQUMsZUFBRCxDQU5QLENBQUE7QUFBQSxNQU9BLElBQUksQ0FBQyxJQUFMLENBQVcsSUFBQSxHQUFJLFFBQWYsQ0FQQSxDQUFBO0FBUUEsTUFBQSxJQUEyQixHQUEzQjtBQUFBLFFBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVyxPQUFBLEdBQU8sR0FBbEIsQ0FBQSxDQUFBO09BUkE7QUFBQSxNQVNBLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQix5QkFBckIsQ0FUQSxDQUFBO0FBQUEsTUFVQSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBc0Isd0JBQUEsR0FBdUIsQ0FBQyxHQUFBLEdBQU0sQ0FBUCxDQUF2QixHQUFnQyxHQUFoQyxHQUFrQyxDQUFDLE1BQUEsR0FBUyxDQUFWLENBQXhELENBVkEsQ0FBQTtBQVdBLE1BQUEsSUFBc0MsVUFBQSxDQUFXLE9BQVgsQ0FBdEM7QUFBQSxRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsY0FBVixFQUEwQixPQUExQixDQUFBLENBQUE7T0FYQTtBQVlBO0FBQUEsV0FBQSw0Q0FBQTtzQkFBQTtBQUFBLFFBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVyxJQUFBLEdBQUksQ0FBZixDQUFBLENBQUE7QUFBQSxPQVpBO0FBQUEsTUFhQSxJQUFJLENBQUMsSUFBTCxDQUFXLElBQUEsR0FBSSxVQUFmLENBYkEsQ0FBQTtBQWVBLE1BQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUNBQWhCLENBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixpQ0FBckIsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2REFBaEIsQ0FBSDtBQUNFLFVBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxzQkFBVixDQUFBLENBREY7U0FGRjtPQWZBO0FBb0JBO0FBQ0UsUUFBQSxVQUFBLEdBQWEsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUF6QixDQUFiLENBQUE7QUFDQSxRQUFBLElBQWlDLFVBQWpDO0FBQUEsVUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBWSxVQUFaLENBQVAsQ0FBQTtTQUZGO09BQUEsY0FBQTtBQUlFLFFBREksY0FDSixDQUFBO0FBQUEsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVosQ0FBQSxDQUpGO09BcEJBO0FBQUEsTUEwQkEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLENBMUJBLENBQUE7YUEyQkEsS0E1QmM7SUFBQSxDQXZGaEIsQ0FBQTs7eUJBQUE7O01BUEYsQ0FBQTs7QUFBQSxFQTRIQSxZQUFBLEdBQ0U7QUFBQSxJQUFBLGtCQUFBLEVBQW9CLFNBQUMsV0FBRCxFQUFjLFdBQWQsR0FBQTtBQUNsQixVQUFBLGVBQUE7QUFBQSxXQUFBLGtEQUFBO2dDQUFBO0FBQ0UsUUFBQSxJQUE2QixLQUFBLElBQVMsV0FBdEM7QUFBQSxpQkFBTyxXQUFZLENBQUEsS0FBQSxDQUFuQixDQUFBO1NBREY7QUFBQSxPQUFBO2FBRUEsS0FIa0I7SUFBQSxDQUFwQjtBQUFBLElBS0EsZ0JBQUEsRUFBa0IsU0FBQyxNQUFELEVBQVMsY0FBVCxHQUFBO0FBQ2hCLFVBQUEsa0JBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxNQUFSLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEIsQ0FEUCxDQUFBO3lEQUVtQixDQUFBLENBQUEsV0FBbkIsSUFBeUIsR0FIVDtJQUFBLENBTGxCO0FBQUEsSUFVQSxxQkFBQSxFQUF1QixTQUFDLE1BQUQsRUFBUyxjQUFULEdBQUE7QUFDckIsVUFBQSwwQ0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFdBQVIsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsQ0FBckIsQ0FBRCxFQUEwQixjQUExQixDQUF0QixDQURQLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQVgsQ0FGVixDQUFBO0FBR0EsTUFBQSxJQUFHLE9BQUg7QUFDRSxRQUFBLE1BQUEsR0FBUyxPQUFRLENBQUEsQ0FBQSxDQUFqQixDQUFBO0FBQUEsUUFDQSxZQUFBLEdBQWUsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBQSxHQUE2QixNQUFNLENBQUMsTUFBcEMsR0FBNkMsQ0FBQyxJQUFJLENBQUMsTUFBTCxHQUFjLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUExQixDQUQ1RCxDQUFBO2VBRUEsQ0FBSyxJQUFBLEtBQUEsQ0FBTSxjQUFjLENBQUMsR0FBckIsRUFBMEIsWUFBMUIsQ0FBTCxFQUE2QyxNQUFPLFVBQXBELEVBSEY7T0FBQSxNQUFBO2VBS0UsQ0FBQyxjQUFELEVBQWdCLEVBQWhCLEVBTEY7T0FKcUI7SUFBQSxDQVZ2QjtHQTdIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/niv/.atom/packages/autocomplete-clang/lib/clang-provider.coffee
