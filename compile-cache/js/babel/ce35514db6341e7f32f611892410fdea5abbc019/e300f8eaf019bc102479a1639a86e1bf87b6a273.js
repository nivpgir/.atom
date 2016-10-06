'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});

// Use this to provide a suggestion for single-word matches.
// Optionally set `wordRegExp` to adjust word-matching.

// Use this to provide a suggestion if it can have non-contiguous ranges.
// A primary use-case for this is Objective-C methods.

// The higher this is, the more precedence the provider gets. Defaults to 0.

// Must be unique. Used for analytics.

// The range(s) to underline to provide as a visual cue for clicking.

// The function to call when the underlined text is clicked.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL25pdnAvLmF0b20vcGFja2FnZXMvaHlwZXJjbGljay9saWIvdHlwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDIiwiZmlsZSI6IkM6L1VzZXJzL25pdnAvLmF0b20vcGFja2FnZXMvaHlwZXJjbGljay9saWIvdHlwZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5leHBvcnQgdHlwZSBIeXBlcmNsaWNrUHJvdmlkZXIgPSB7XG4gIC8vIFVzZSB0aGlzIHRvIHByb3ZpZGUgYSBzdWdnZXN0aW9uIGZvciBzaW5nbGUtd29yZCBtYXRjaGVzLlxuICAvLyBPcHRpb25hbGx5IHNldCBgd29yZFJlZ0V4cGAgdG8gYWRqdXN0IHdvcmQtbWF0Y2hpbmcuXG4gIGdldFN1Z2dlc3Rpb25Gb3JXb3JkPzogKFxuICAgIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcmFuZ2U6IGF0b20kUmFuZ2UsXG4gICkgPT4gUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+LFxuXG4gIHdvcmRSZWdFeHA/OiBSZWdFeHAsXG5cbiAgLy8gVXNlIHRoaXMgdG8gcHJvdmlkZSBhIHN1Z2dlc3Rpb24gaWYgaXQgY2FuIGhhdmUgbm9uLWNvbnRpZ3VvdXMgcmFuZ2VzLlxuICAvLyBBIHByaW1hcnkgdXNlLWNhc2UgZm9yIHRoaXMgaXMgT2JqZWN0aXZlLUMgbWV0aG9kcy5cbiAgZ2V0U3VnZ2VzdGlvbj86IChcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgcG9zaXRpb246IGF0b20kUG9pbnQsXG4gICkgPT4gUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+LFxuXG4gIC8vIFRoZSBoaWdoZXIgdGhpcyBpcywgdGhlIG1vcmUgcHJlY2VkZW5jZSB0aGUgcHJvdmlkZXIgZ2V0cy4gRGVmYXVsdHMgdG8gMC5cbiAgcHJpb3JpdHk/OiBudW1iZXIsXG5cbiAgLy8gTXVzdCBiZSB1bmlxdWUuIFVzZWQgZm9yIGFuYWx5dGljcy5cbiAgcHJvdmlkZXJOYW1lPzogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgSHlwZXJjbGlja1N1Z2dlc3Rpb24gPSB7XG4gIC8vIFRoZSByYW5nZShzKSB0byB1bmRlcmxpbmUgdG8gcHJvdmlkZSBhcyBhIHZpc3VhbCBjdWUgZm9yIGNsaWNraW5nLlxuICByYW5nZTogP2F0b20kUmFuZ2UgfCA/QXJyYXk8YXRvbSRSYW5nZT4sXG5cbiAgLy8gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgdW5kZXJsaW5lZCB0ZXh0IGlzIGNsaWNrZWQuXG4gIGNhbGxiYWNrOiAoKCkgPT4gbWl4ZWQpIHwgQXJyYXk8e3JpZ2h0TGFiZWw/OiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIGNhbGxiYWNrOiAoKSA9PiBtaXhlZH0+LFxufTtcbiJdfQ==
//# sourceURL=/C:/Users/nivp/.atom/packages/hyperclick/lib/types.js