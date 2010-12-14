@echo off
echo -----------------------------------------------------
echo          Ext.ux.YoutubePlayer Build Tool
echo  (c) 2009 Thorsten Suckow-Homberg ts@siteartwork.de
echo -----------------------------------------------------
echo  Using yuicompressor:
echo  http://developer.yahoo.com/yui/compressor/
echo -----------------------------------------------------
echo.

if "%1"=="" goto help

set yuicompressor_path=%1

if not exist %yuicompressor_path% goto error_message

:process
set tp=..\..\
set youtubeplayer_file_list_component=%tp%src\YoutubePlayer.js
set youtubeplayer_file_list_control=%tp%src\YoutubePlayerControl.js
set youtubeplayer_file_list_all=%youtubeplayer_file_list_component%+%youtubeplayer_file_list_control%

set youtubeplayer_cssfile_list_core=%tp%src\resources\css\ext-ux-youtubeplayer.css
set youtubeplayer_cssfile_list_control=%tp%src\resources\css\ext-ux-youtubeplayer-control.css
set youtubeplayer_cssfile_list_all=%youtubeplayer_cssfile_list_core%+%youtubeplayer_cssfile_list_control%


echo ...building CSS files...

echo ...merging files for ext-ux-youtubeplayer.css...
copy /B /Y %youtubeplayer_cssfile_list_core% %tp%build\_tmp.css
echo ...building ext-ux-youtubeplayer.css file...
java -jar %yuicompressor_path% -o %tp%build\resources\css\ext-ux-youtubeplayer.css --charset UTF-8 %tp%build\_tmp.css
echo Done!

echo ...merging files for ext-ux-youtubeplayer-all.css...
copy /B /Y %youtubeplayer_cssfile_list_all% %tp%build\_tmp.css
echo ...building ext-ux-youtubeplayer-all.css file...
java -jar %yuicompressor_path% -o %tp%build\resources\css\ext-ux-youtubeplayer-all.css --charset UTF-8 %tp%build\_tmp.css
echo Done!

echo ...merging files for ext-ux-youtubeplayer-control.css...
copy /B /Y %youtubeplayer_cssfile_list_control% %tp%build\_tmp.css
echo ...building ext-ux-youtubeplayer-control.css file...
java -jar %yuicompressor_path% -o %tp%build\resources\css\ext-ux-youtubeplayer-control.css --charset UTF-8 %tp%build\_tmp.css
echo Done!

echo ...building JS files...

echo ...merging files for ext-ux-youtubeplayer-component.js...
copy /B /Y %youtubeplayer_file_list_component% %tp%build\_tmp.js
echo ...building ext-ux-youtubeplayer-component.js file...
java -jar %yuicompressor_path% -o %tp%build\ext-ux-youtubeplayer-component.js --charset UTF-8 %tp%build\_tmp.js
echo Done!

echo ...merging files for ext-ux-youtubeplayer-control.js...
copy /B /Y %youtubeplayer_file_list_control% %tp%build\_tmp.js
echo ...building ext-ux-youtubeplayer-control.js file...
java -jar %yuicompressor_path% -o %tp%build\ext-ux-youtubeplayer-control.js --charset UTF-8 %tp%build\_tmp.js
echo Done!

echo ...merging files for ext-ux-youtubeplayer-all.js...
copy /B /Y %youtubeplayer_file_list_all% %tp%build\_tmp.js
echo ...building ext-ux-youtubeplayer-all.js file...
java -jar %yuicompressor_path% -o %tp%build\ext-ux-youtubeplayer-all.js --charset UTF-8 %tp%build\_tmp.js
echo Done!

echo ...merging files for ext-ux-youtubeplayer-all-debug.js...
copy /B /Y %youtubeplayer_file_list_all% %tp%build\ext-ux-youtubeplayer-all-debug.js
echo Done

echo ...removing temp files...
del %tp%build\_tmp.js
del %tp%build\_tmp.css

echo FINISHED!
goto end

:help
echo Usage: make.bat [path to yuicompressor.jar]
echo Example: make.bat C:/Tools/yuicompressor-2.4.jar
echo Download yuicompressor at http://developer.yahoo.com/yui/compressor/
echo.
goto end

:error_message
echo.
echo Error: %yuicompressor_path% does not seem to point to the yuicompressor jar
echo.

:end