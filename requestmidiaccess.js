/*
    Firefox addon "MIDI Input Provider"
    Copyright (C) 2017  Manuel Reimer <manuel.reimer@gmx.de>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// This ends up in page context named as "navigator.requestMIDIAccess"
// It is meant to wrap the "simple intermediate API" fron "contentscript.js"
// into a partial WebMIDI compatible implementation.
var REQUESTMIDIACCESS = function() {
  function MIDIAccess(aList) {
    this.inputs = new Map();
    this.outputs = new Map();
    this.onstatechange = false;
    this.sysexEnabled = false;
    if (aList) {
      for (var index = 0; index < aList.length; index++) {
        var entry = aList[index];
        this.inputs.set(entry.id, new MIDIInput(entry));
      }
    }
  };

  function MIDIInput(aListEntry) {
    var context = this;
    this._id = aListEntry.id;
    Object.defineProperty(this, 'id', {get: function(){return context._id;}});
    this.manufacturer = "";
    this.name = aListEntry.name;
    this.type = "input";
    this.version = "";
    this._state = "disconnected";
    Object.defineProperty(this, 'state', {get: function(){return context._state;}});
    this._connection = "closed";
    Object.defineProperty(this, 'connection', {get: function(){return context._connection}});
    this.open = function(){};
    this.close = function(){};
    Object.defineProperty(this, 'onmidimessage', {set: function(aValue) {
      context._onmidimessage = aValue
      if (context._state == "disconnected") {
        context._state = "connected";
        context._connection = "open";
        window.MidiInputProvider.BindCallback(context._id, function(aMIDI){
          context._onmidimessage({
            currentTarget: "MIDIInput",
            data: aMIDI
          });
        });
      }
    }});
  }

  return new Promise(function(resolve, reject) {
    window.MidiInputProvider.Init(function() {
      window.MidiInputProvider.GetList(function(aResponse) {
        resolve(new MIDIAccess(aResponse));
      }, reject);
    }, reject);
  });
};