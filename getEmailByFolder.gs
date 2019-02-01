/*
  Copyright 2019 David Hunter

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.

  Function:  Reads messages that have been forwarded via email into a Gmail
             folder with the passed label and creates a text file that is then
             parsed in a way that can be digested into a SIEM, in case it is
             made available to logstash for parsing and subsequent storage into
             an elasticsearch cluster.

  Notes:     I did this as an exercise in learing Google Application Scripting.
            Given that there are most likely other ways to accomplish this.
*/

function getEmailByLabel(docName, folderLabel) {
  var emailMessages = [];
  var sizeOfMsgArray;
  var newEmailMessages = [];

  /* Create a collection of emails based on the label, retrieve the messages
     & create messagebidy array */

  var threads = GmailApp.search("label:" + folderLabel);
  var messages = GmailApp.getMessagesForThreads(threads);
  messages.forEach(function(messages) {
    messages.forEach(function(d) {
      sizeOfMsgArray = emailMessages.push(d.getPlainBody());
    });
  });

  // Store the bodies of the emails into a text file
  DriveApp.createFile(docName, emailMessages);

  /*
  Read in the text file, convert the contents to a string and then into an
  array of lines.  Then we de-duplicate the array of log messages.  This is
  needed as the Orbi tends to resend log messages.  This is a very simplistic
  de-duplicator and time consuming.

  NB: Would be great if I could figure out how to parse the message body
      into individual lines
  */

  // Open the fle and convert the contents into an array of lines.  There
  // should only be one since we delete it after we clean up.

  logFiles = DriveApp.getFilesByName(docName);
  if (logFiles.hasNext() == false) {
    Logger.log("No files found, exiting.");
    return false;
  };

  countOfFiles = 0;
  var thisFile;
  var docContent;
  while (logFiles.hasNext()) {
    thisfile = logFiles.next();
    countOfFiles = countOfFiles + 1;
    docContent = thisfile.getBlob();
  };

  var docLines = [];
  docString = docContent.getDataAsString();
  docLines = docString.split(/\n/);
  Logger.log("Before Count of docLines = " + docLines.length);

  // Sort the array and then de-duplicate it and then store it back
  docLines.sort();
  var newDocLines = [];
  var baseCompare =0;
  var currentCompare = 0;
  var nextCompare= 1;
  while (baseCompare < docLines.length) {
    if (docLines[currentCompare] == docLines[nextCompare]) {
      nextCompare = nextCompare + 1;
    } else {
      newDocLines.push(docLines[baseCompare]);
      baseCompare = nextCompare;
      currentCompare = nextCompare;
      nextCompare = nextCompare + 1;
    }
  }

  Logger.log("After Count of docLines = " + newDocLines.length);

  DriveApp.createFile(docName, newDocLines,"text/plain");

}
