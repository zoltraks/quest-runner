# Allow to globally set insecure mode

It should be possible to set the insecure mode globally, so that it is not necessary to set it for each request.

Add "--insecure" (short "-k") to the command line arguments.

Add setInsecure() method to the Test class which will work the same way as acceptSelfSignedCertificate().
When it is called with no arguments it should set the insecure mode to true. When it is called with an argument it should set the insecure mode to the value of the argument (true or false).
