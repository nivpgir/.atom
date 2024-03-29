(function() {
  module.exports = {
    initialize: function() {
      this._killed = this.killing = false;
      this._yanked = this.yanking = false;
      this.previousCommand = null;
      this.recenters = 0;
      return this._recentered = false;
    },
    beforeCommand: function(event) {
      return this.isDuringCommand = true;
    },
    afterCommand: function(event) {
      if ((this.killing = this._killed)) {
        this._killed = false;
      }
      if ((this.yanking = this._yanked)) {
        this._yanked = false;
      }
      if (this._recentered) {
        this._recentered = false;
        this.recenters = (this.recenters + 1) % 3;
      } else {
        this.recenters = 0;
      }
      this.previousCommand = event.type;
      return this.isDuringCommand = false;
    },
    killed: function() {
      return this._killed = true;
    },
    yanked: function() {
      return this._yanked = true;
    },
    recentered: function() {
      return this._recentered = true;
    },
    yankComplete: function() {
      return this.yanking && !this._yanked;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiZmlsZTovLy9DOi9Vc2Vycy9uaXZwLy5hdG9tL3BhY2thZ2VzL2F0b21pYy1lbWFjcy9saWIvc3RhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUF0QixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FEdEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFGbkIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUhiLENBQUE7YUFJQSxJQUFDLENBQUEsV0FBRCxHQUFlLE1BTEw7SUFBQSxDQUFaO0FBQUEsSUFPQSxhQUFBLEVBQWUsU0FBQyxLQUFELEdBQUE7YUFDYixJQUFDLENBQUEsZUFBRCxHQUFtQixLQUROO0lBQUEsQ0FQZjtBQUFBLElBVUEsWUFBQSxFQUFjLFNBQUMsS0FBRCxHQUFBO0FBQ1osTUFBQSxJQUFHLENBQUMsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsT0FBYixDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQVgsQ0FERjtPQUFBO0FBR0EsTUFBQSxJQUFHLENBQUMsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsT0FBYixDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQVgsQ0FERjtPQUhBO0FBTUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxXQUFKO0FBQ0UsUUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEtBQWYsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBZCxDQUFBLEdBQW1CLENBRGhDLENBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQWIsQ0FKRjtPQU5BO0FBQUEsTUFZQSxJQUFDLENBQUEsZUFBRCxHQUFtQixLQUFLLENBQUMsSUFaekIsQ0FBQTthQWFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLE1BZFA7SUFBQSxDQVZkO0FBQUEsSUEwQkEsTUFBQSxFQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FETDtJQUFBLENBMUJSO0FBQUEsSUE2QkEsTUFBQSxFQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FETDtJQUFBLENBN0JSO0FBQUEsSUFnQ0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxXQUFELEdBQWUsS0FETDtJQUFBLENBaENaO0FBQUEsSUFtQ0EsWUFBQSxFQUFjLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxPQUFELElBQWEsQ0FBQSxJQUFLLENBQUEsUUFBckI7SUFBQSxDQW5DZDtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/C:/Users/nivp/.atom/packages/atomic-emacs/lib/state.coffee
