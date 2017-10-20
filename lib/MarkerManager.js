'use babel';

import filter from 'lodash/filter';

export default class MarkerManager {
  constructor() {
    this.markers = {};
  }

  getMarkers(textEditorId) {
    return this.markers[textEditorId] || {};
  }

  add(textEditorId, markerId, line) {
    this.markers = {
      ...this.markers,
      [textEditorId]: {
        ...this.getMarkers(textEditorId),
        [markerId]: {
          id: markerId,
          line,
        },
      },
    };
  }

  remove(textEditorId, markerId) {
    this.markers = {
      ...this.markers,
      [textEditorId]: {
        ...this.getMarkers(textEditorId),
        [markerId]: undefined,
      },
    };
  }

  findByRange(textEditorId, fromLine, toLine) {
    return filter(this.getMarkers(textEditorId), (marker) => {
      if (!marker) {
        return false;
      }

      return marker.line >= fromLine && marker.line <= toLine;
    });
  }
}
