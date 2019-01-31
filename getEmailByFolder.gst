/*
  Copyright 2019 David Hunter
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the "Software"), to deal in the Software without restriction, 
  including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or 
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT 
  NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  Function:  Reads messages that have been forwarded via email into a Gmail folder with the passed label
             and creates a text file that is then parsed in a way that can be digested into a SIEM, in 
             case it is made available to logstash for parsing and subsequent storage into an elasticsearch
             cluster.  
  
  Notes:     I did this as an exercise in learing Google Application Scripting.  Given that there are most
             likely other ways to accomplish this. 
*/ 

function getEmailByLabel(docName, folderLabel) {
  // Create a collection of emails based on the label, retrieve the messages & create messagebidy array
  var folderLabel = "basqueorbilogs";
  var threads = GmailApp.search("label:" + folderLabel);
  var messages = GmailApp.getMessagesForThreads(threads);
  messages.forEach(function(messages) {
    messages.forEach(function(d) {
      emailMessages.push(d.getPlainBody());
    });
  });

  // Store the bodies of the emails into the text file
  // NB: This overwrites the file each time.
  var logDocument = DriveApp.createFile(docName, emailMessages);
}
