/**
 * Licensed under GNU LESSER GENERAL PUBLIC LICENSE Version 3
 *
 * @author Thorsten Suckow-Homberg <ts@siteartwork.de>
 * @url http://www.siteartwork.de/youtubeplayer
 */

Ext.namespace('Ext.ux.YoutubePlayer');

/**
 * A component utilizing the Youtube chromeless API.
 *
 * When loading the file into your application, the function "onYouTubePlayerReady"
 * will be added automatically into the window's scope. If a function with the same
 * name within that scope already exists, an exception will be thrown.
 *
 * Flaws: Mozilla https://bugzilla.mozilla.org/show_bug.cgi?id=262354
 *
 * Example usage:
<pre>
    var youtubePlayerPanel = new Ext.ux.YoutubePlayer({
        developerKey : [your developer key here],
        playerId     : 'myplayer',
        ratioMode    : 'strict',
        bgColor      : "#000000",
        cls          : 'ext-ux-youtubeplayer'
    });

    var w = new Ext.Window({
        width  : 400,
        height : 400,
        title  : "Test",
        layout : 'fit',
        items  : [
            youtubePlayerPanel
        ],
        bbar : new Ext.ux.YoutubePlayer.Control({
            player : youtubePlayerPanel,
            border : false,
            id     : 'control',
            style  : 'border:none;'
        })
    });
</pre>
 *
 *
 *
 * @class Ext.ux.YoutubePlayer
 * @extends Ext.FlashComponent
 * @author Thorsten Suckow-Homberg <ts@siteartwork.de>
 * @version 0.3
 */
Ext.ux.YoutubePlayer = Ext.extend(Ext.FlashComponent, {

    /**
     * @cfg {String} ratioMode
     * Possible values:
     * <ul>
     * <li>'strict' - The video will always show at 320x400 (w x h),
     * but if the overall parent's container size is smaller than this value, the video
     * will be proportional resized to keep the aspect ratio.
     * </li>
     * <li> 'stretch' - The video will be strethced in width and height according
     * to the parent's container width and height
     * </li>
     * </ul>
     * Defaults to 'stretch'.
     */

    /**
     * @cfg {String} playerId
     * The id of the flash object. The id attribute of the embedded flash object
     * will be set to this property.
     */

    /**
     * @cfg {String} bgColor
     * The background color of the flash player
     */

    /**
     * @param {HTMLElement}
     * The flash player controlled by this component
     * @private
     */
    player : null,

    /**
     * The id of the last video requested. Will be stored even if an error loading the video
     * occured.
     */
    videoId : null,

    /**
     * Sets default confg operations and attaches new events to this component so
     * interaction with the flash player works.
     */
    initComponent : function()
    {
        this.addEvents(
            /**
             * @event ready
             * Fires after the youtube flash player has been loaded and is accessible
             * via javascript
             * @param {Ext.ux.YoutubePlayer} panel The Ext.BoxComponent derivat holding the flash object
             * @param {HTMLElement} player The DOM Node representing the flash player
             */
             'ready',

             /**
              * @event stateChange
              * Fires whenever the player's state changes.
              * @param {String} state Possible values are 'unstarted', 'ended', 'playing', 'paused',
              * 'buffering', 'video_cued'. When the SWF is first loaded, it will broadcast an 'unstarted' event.
              * When the video is cued and ready to play, it will broadcast a 'video_cued'.
              * @param {Ext.ux.YoutubePlayer} panel The Ext.BoxComponent that holds the flash player
              * @param {HTMLElement} player The Dom node representing the flash player
              */
              'stateChange',

             /**
              * @event error
              * Fired when an error in the player occurs.
              * @param {Number} errorCode Currently there is only one error code, which is 'video_not_found'.
              * This occurs when a video has been removed (for any reason), or it has been marked as private or
              * non-embeddable by the user.
              * @param {Ext.ux.YoutubePlayer} panel The Ext.BoxComponent that holds the flash player
              * @param {HTMLElement} player The Dom node representing the flash player
              */
              'error'
        );


        Ext.apply(this, {
            ratioMode : this.ratioMode || 'normal',
            id        : this.playerId,
            swfId     : this.playerId,
            style     : this.ratioMode == 'strict' ? 'position:relative'
                                                   : 'position:static'
        });

        Ext.applyIf(this, {
            url       : "http://www.youtube.com/apiplayer?"
                        +"&enablejsapi=1&version=3&playerapiid="+
                        this.playerId,
            start     : false,
            controls  : false,
            cls       : 'ext-ux-youtubeplayer '+this.ratioMode,
            scripting : 'always',
            params    : {
                wmode   : 'opaque',
                bgcolor : this.bgColor || "#cccccc"
            }
        });

        if (!Ext.ux.YoutubePlayer.Players) {
            Ext.ux.YoutubePlayer.Players = [];
        }
        Ext.ux.YoutubePlayer.Players[this.playerId] = this;
    },

    /**
     * Sets the player controlled by this component once the flash object is
     * fully initialized.
     * This method is API reserved.
     *
     * @private
     */
    _initPlayer : function()
    {
        this.player = this.swf;
    },

    /**
     * Due to the nature of passig a callback to the youtube player, another method has to
     * intercept the state events and translate them into ext-events.
     * @param {Number} state The state of the player, which translates into it's string representation
     * for easier identifying the events. If the state number is not known yet by this api, the
     * state "unknown" will be passed as the state event identifier.
     *
     * This method is API reserved.
     * @private
     */
    _delegateStateEvent : function(state)
    {
        switch (state) {
            case -1:  state = 'unstarted';  break;
            case  0:  state = 'ended';      break;
            case  1:  state = 'playing';    break;
            case  2:  state = 'paused';     break;
            case  3:  state = 'buffering';  break;
            case  5:  state = 'video_cued'; break;
            default : state = 'unknown';    break;
        }

        this.fireEvent('stateChange', state, this, this.player);
    },

    /**
     * Due to the nature of passig a callback to the youtube player, another method has to
     * intercept the error events and translate them into ext-events.
     * @param {Number} errorCode The code as passed by the flash playerstate of the player,
     * which translates into it's string representation for easier identifying the events.
     * If the error number is not known yet by this api, the
     * state "unknown" will be passed as the error event identifier.
     *
     * This method is API reserved.
     * @private
     */
    _delegateErrorEvent : function(errorCode)
    {
        switch (errorCode) {
            case 100:  errorCode = 'video_not_found';  break;
            default :  errorCode = 'unknown';          break;
        }

        this.fireEvent('error', errorCode, this, this.player);
    },

    /**
     * Overwrites parent implemenmtation to keep aspect ratio of the player window
     * if needed.
     */
    onResize : function(w, h, w1, h1)
    {
        if (this.playerAvailable()) {
            this.adjustRatio(this.getWidth(), this.getHeight());
        }
    },

    /**
     * Adjusts the width and height of the video according to the ratioMode
     * property.
     */
    adjustRatio : function(width, height)
    {
        var pStyle = this.player.style;

        switch (this.ratioMode) {
            case 'strict':

                if (width < 400 || height < 320) {
                    var newHeight =  Math.floor(width * 0.8);

                    if (newHeight > height) {
                        width = Math.floor(height / 0.8);
                    } else {
                        height = newHeight;
                    }
                } else {
                    if (height > 320) {
                        height = 320;
                        width  = 400;
                    }
                }

                pStyle.marginTop  = -Math.floor(height/2)+'px';
                pStyle.marginLeft = -Math.floor(width/2)+'px';
                pStyle.height = height+'px';
                pStyle.width  = width+'px';
                pStyle.top  = '50%';
                pStyle.left = '50%';
                this.setPlayerSize(width, height);
            break;

            case 'stretch':
                pStyle.margin   = 'auto';
                pStyle.height   = height+'px';
                pStyle.width    = width+'px';
                this.setPlayerSize(width, height);
            break;
        }
    },

    /**
     * Helper function for checking if the flash movie is still available.
     */
    playerAvailable : function()
    {
        return (this.player && this.player.getPlayerState) ? true : false;
    },

//-------------------------- Youtube API

    /**
     * Load the specified video and starts playing the video. If startSeconds (number can be a float)
     * is specified, the video will start from the closest keyframe to the specified time.
     *
     * @param {String} videoId
     * @param {Number/Float} startSeconds
     */
    loadVideoById : function(videoId, startSeconds)
    {
        this.player.loadVideoById(videoId, startSeconds);
        this.videoId = videoId;
    },

    /**
     * Loads the specified video's thumbnail and prepares the player to play the video.
     * The player does not request the FLV until playVideo() or seekTo() is called.
     * startSeconds accepts a float/integer and specifies the time that the video should
     * start playing from when playVideo() is called. If you specify startSeconds and then
     * call seekTo(), the startSeconds is forgotten and the player plays from the time specified
     * in the seekTo() call. When the video is cued and ready to play, the player will
     * broadcast the 'video_cued' event.
     *
     * @param {String} videoId
     * @param {Number/Float} startSeconds
     */
    cueVideoById : function(videoId, startSeconds)
    {
        this.player.cueVideoById(videoId, startSeconds);
        this.videoId = videoId;
    },

    /**
     * Sets the size of the chromeless player. This method should be used in favor of setting
     * the width + height of the MovieClip directly. Note that this method does not constrain
     * the proportions of the video player, so you will need to maintain a 4:3 aspect ratio.
     * When embedding the player directly in HTML, the size is updated automatically to the
     * Stage.width and Stage.height values, so there is no need to call setSize() when
     * embedding the chromeless player directly into an HTML page. The default size of the SWF
     * when loaded into another SWF is 320px by 240px
     *
     * @param {Number} width
     * @param {Number} height
     */
    setPlayerSize : function(width, height)
    {
        if (!this.playerAvailable()) {
            return;
        }

        this.player.setSize(width, height);
    },

    /**
     * Plays the currently cued/loaded video.
     */
    playVideo : function()
    {
        if (!this.playerAvailable()) {
            return;
        }
        this.player.playVideo();
    },

    /**
     * Pauses the currently playing video.
     */
    pauseVideo : function()
    {
        if (!this.playerAvailable()) {
            return;
        }
        this.player.pauseVideo();
    },

    /**
     * Stops the current video. This also closes the NetStream object and cancels
     * the loading of the video. Once stopVideo() is called, a video cannot be resumed
     * without reloading the player or loading a new video.
     * When calling stopVideo(), the player will first broadcast an 'ended' event,
     * followed by an 'unstarted' event.
     */
    stopVideo : function()
    {
        if (!this.playerAvailable()) {
            return;
        }
        this.player.stopVideo();
    },

    /**
     * Clears the video display. Useful if you want to clear the video remnant after
     * calling stopVideo().
     */
    clearVideo : function()
    {
        if (!this.playerAvailable()) {
            return;
        }
        this.videoId = null;
        this.player.clearVideo();
    },

    /**
     * Returns the number of bytes loaded for the current video.
     *
     * @return {Number}
     */
    getVideoBytesLoaded : function()
    {
        if (!this.playerAvailable()) {
            return 0;
        }
        return this.player.getVideoBytesLoaded();
    },

    /**
     * Returns the size in bytes of the currently loaded/playing video.
     *
     * @return {Number}
     */
    getVideoBytesTotal : function()
    {
        if (!this.playerAvailable()) {
            return 0;
        }
        return this.player.getVideoBytesTotal();
    },

    /**
     * Returns the number of bytes the video file started loading from.
     * Example scenario: the user seeks ahead to a point that hasn't loaded yet,
     * and the player makes a new request to play a segment of the video that hasn't loaded yet.
     *
     * @return {Number}
     */
    getVideoStartBytes : function()
    {
        if (!this.playerAvailable()) {
            return 0;
        }
        return this.player.getVideoStartBytes();
    },

    /**
     * Mutes/unmutes the player.
     *
     * @param {Boolean} mute <tt>true</tt> to mute the player, <tt>false</tt> to unmute the
     * player
     */
    mute : function(mute)
    {
        if (!this.playerAvailable()) {
            return;
        }
        if (mute === false) {
            this.player.unMute();
            // hack: on some systems, the API does not recognize a unMute directly,
            // but setting the actual volume value again helps.
            this.setVolume(this.getVolume());
        } else {
            this.player.mute();
        }
    },

    /**
     * Returns true if the player is muted, false if not.
     *
     * @return {Boolean}
     */
    isMuted : function(mute)
    {
        if (!this.playerAvailable()) {
            return true;
        }
        return this.player.isMuted();
    },

    /**
     * Sets the volume. Accepts an integer between 0-100.
     *
     * @param {Number} volume
     */
    setVolume : function(volume)
    {
        if (!this.playerAvailable()) {
            return;
        }
        this.player.setVolume(volume);
    },

    /**
     * Returns the player's current volume, an integer between 0-100. Note that
     * getVolume() will return the volume even if the player is muted.
     *
     * @return {Number}
     */
    getVolume : function()
    {
        if (!this.playerAvailable()) {
            return 0;
        }
        return this.player.getVolume();
    },

    /**
     * Seeks to the specified time of the video in seconds. The allowSeekAhead
     * determines whether or not the player will make a new request to the server
     * if seconds is beyond the currently loaded video data. Note that seekTo() will
     * attempt to seek to the closest keyframe to the seconds specified. This means that
     * sometimes the play head may actually seek to just before or just after the requested
     * time, usually no more than ~2 seconds.
     *
     * @param {Number} seconds
     * @param {Boolean} allowSeekAhead
     */
    seekTo : function(seconds, allowSeekAhead)
    {
        if (!this.playerAvailable()) {
            return;
        }

        this.player.seekTo(seconds, allowSeekAhead);
    },

    /**
     * Returns the state of the player. Possible values are 'unstarted', 'ended',
     * 'playing', 'paused', 'buffering', 'video_cued'. Returns 'unknown' if the player's
     * state is not yet known by this api.
     *
     * @return {String}
     */
    getPlayerState : function()
    {
        var state = -9999;

        if (!this.playerAvailable()) {
            return;
        } else {
            state = this.player.getPlayerState();
        }

        switch (state) {
            case -1:  state = 'unstarted';  break;
            case  0:  state = 'ended';      break;
            case  1:  state = 'playing';    break;
            case  2:  state = 'paused';     break;
            case  3:  state = 'buffering';  break;
            case  5:  state = 'video_cued'; break;
            default : state = 'unknown';    break;
        }

        return state;
    },

    /**
     * Returns the available quality levels of the loaded video, or an empty array
     * if no current video is available.
     *
     * @return {Array}
     */
    getAvailableQualityLevels : function()
    {
        if (!this.playerAvailable()) {
            return [];
        }

        return this.player.getAvailableQualityLevels();
    },

    /**
     * Sets the playback quality for the currently available video.
     *
     * @param {String} level "small", "medium", "large" or "hd720"
     */
    setPlaybackQuality: function(level)
    {
        if (!this.playerAvailable()) {
            return;
        }

        return this.player.setPlaybackQuality(level);
    },

    /**
     * Returns the playback quality for the currently available video,
     * or undefined.
     *
     * @return {mixed} "small", "medium", "large", "hd720" or undefined
     */
    getPlaybackQuality: function()
    {
        if (!this.playerAvailable()) {
            return undefined;
        }

        return this.player.getPlaybackQuality();
    },

    /**
     * Returns the current time in seconds of the current video.
     *
     * @return {Number}
     */
    getCurrentTime : function()
    {
        if (!this.playerAvailable()) {
            return 0;
        }

        return this.player.getCurrentTime();
    },

    /**
     * Returns the duration in seconds of the currently playing video. Note that
     * getDuration() will return 0 until the video's metadata is loaded, which
     * normally happens just after the video starts playing.
     *
     * @return {Number}
     */
    getDuration : function()
    {
        if (!this.playerAvailable()) {
            return 0;
        }

        return this.player.getDuration();
    },

    /**
     * Returns the YouTube.com URL for the currently loaded/playing video.
     *
     * @return {String}
     */
    getVideoUrl : function()
    {
        if (!this.playerAvailable()) {
            return "";
        }

        return this.player.getVideoUrl();
    },

    /**
     * Returns the embed code for the currently loaded/playing video.
     *
     * @return {String}
     */
    getVideoEmbedCode : function()
    {
        if (!this.playerAvailable()) {
            return "";
        }

        return this.player.getVideoEmbedCode();
    }

});

// create a sequence if onYouTubePlayerReady is already available
var _onYouTubePlayerReady = function(playerId) {
    var panel = Ext.ux.YoutubePlayer.Players[playerId];
    if (panel) {
        var player = document.getElementById(playerId);
        panel._initPlayer();
        player.addEventListener('onStateChange', "Ext.ux.YoutubePlayer.Players['"+playerId+"']._delegateStateEvent");
        player.addEventListener('onError', "Ext.ux.YoutubePlayer.Players['"+playerId+"']._delegateErrorEvent");
        panel.adjustRatio(panel.getWidth(), panel.getHeight());
        panel.fireEvent('ready', panel, player);
    }
};

if (!window.onYouTubePlayerReady) {
    window.onYouTubePlayerReady = _onYouTubePlayerReady;
} else {
    throw("\"onYouTubePlayerReady\" is already defined. Cannot use Ext.ux.YoutubePlayer.")
}/**
 * Licensed under GNU LESSER GENERAL PUBLIC LICENSE Version 3
 *
 * @author Thorsten Suckow-Homberg <ts@siteartwork.de>
 * @url http://www.siteartwork.de/youtubeplayer
 */

Ext.namespace('Ext.ux.YoutubePlayer');

/**
 * An example implementation of a control for the Ext.ux.YoutubePlayer.
 * It provides functionality for loading videos, muting/unmuting a video,
 * setting the volume and paging between items in a playlist (though a playlist
 * is neither part of the Ext.ux.YoutubePlayer nor the Ext.ux.YoutubePlayer.Control).
 *
 * Developers Note: This version was enhanced to be used with Ext3.0RC1. You may find a few
 * workarounds in here, which should be checked against a later release of Ext3.0.
 *
 * @class {Ext.ux.YoutubePlayer.Control}
 * @extends {Ext.Toolbar}
 *
 * @author Thorsten Suckow-Homberg <ts@siteartwork.de>
 *
 * Released as a sub project of conjoon <http://www.conjoon.org>
 */
Ext.ux.YoutubePlayer.Control = Ext.extend(Ext.Toolbar, {

    /**
     * The youtube player this control should take care of.
     * @cfg {Ext.ux.YoutubePlayer} player
     */

    /**
     * The task that is responsible for reading out different states from the video
     * such as bytesLoaded
     */
    task : null,

    /**
     * The table cell in the toolbar that holds information about the runtime
     * of the video
     */
    elRuntime : null,

    /**
     * An ext button providing actions for loading a video.
     */
    ejectButton : null,

    /**
     * An ext button for starting the video.
     */
    playButton : null,

    /**
     * An ext button for stopping the currently playing video
     */
    stopButton : null,

    /**
     * An ext button for playing the previous item in a playlist (if any)
     */
    previousButton : null,

    /**
     * An ext button for playing the next item in a playlist (if any)
     */
    nextButton : null,

    /**
     * The button to mute/unmute the sound of the video.
     */
    muteButton : null,

    /**
     * Slider to control the volume of the video
     */
    volumeSlider : null,

    /**
     * Controls the playback of the video.
     */
    sliderField : null,

    /**
     * tells if the user is currently adjusting the play position in the stream
     */
    isAdjusting : false,

    /**
     * @type {Ext.Button} Menubutton for selecting playback quality
     */
    qualityButton : null,

    /**
     * @type {Ext.menu.Item} menu item for quality "small" entry
     */
    qualitySmallItem : null,

    /**
     * @type {Ext.menu.Item} menu item for quality "medium" entry
     */
    qualityMediumItem : null,

    /**
     * @type {Ext.menu.Item} menu item for quality "large" entry
     */
    qualityLargeItem : null,

    /**
     * @type {Ext.menu.Item} menu item for quality "HD720" entry
     */
    qualityHd720Item : null,

    /**
     * @type {Ext.menu.Item} menu item for letting the player auto chose quality
     */
    qualityAutoItem : null,


    /**
     * Listener for the eject button. Will show a dialog which prompts the user
     * for a video id or video url to play.
     * The parser for the video is very simple. Much room for improvements here.
     */
    _onEject : function()
    {
        var control = this;
        Ext.Msg.prompt('Load video', 'Please enter the video id or url:', function(btn, text){
            if (btn == 'ok'){
                var id = control._parseVideoId(text);
                if (!id) {
                    Ext.Msg.alert(
                        'Load video',
                        "id \""+id+"\" does not seem to be a valid video id"
                    );
                    return;
                }
                control.player.stopVideo();
                control.player.clearVideo();
                control.player.cueVideoById(id);
            }
        });
    },

    /**
     * Helper function for parsing a given string for a youtube video id
     * Allowed strings are f.e.
     * http://www.youtube.com/watch?v=-dsdsdsd&sdfsf
     * http://www.youtube.com/watch/v/-dsdsdsd
     * -sdsdjh78sdds
     * fsfddsffdsd-sdf324243
     *
     * @return {String} the parsed video id or "null" if no video id
     * could be found.
     */
    _parseVideoId : function(text)
    {
        var mpos  = text.indexOf('v=');
        var mpos1 = text.indexOf('/v/');

        if (mpos != -1 || mpos1 != -1) {
            text =text.replace(
                /(.*)(v=|\/v\/)([^&]+)(.*)/gi,
                "$3"
            );
        } else {
            text = /^[a-zA-Z0-9_\-]+$/.test(text) === false ? null : text;
        }

        return text;
    },

    /**
     * Listener or the error-event of the player. If any error occurs, the player
     * will be stopped.
     */
    _onError : function(errorCode, playerPanel, player)
    {
        playerPanel.stopVideo();
        Ext.Msg.alert('Error', 'The video you requested could not be played. Error code '+errorCode);
    },

    /**
     * Listener for the progress slider, i.e. when the slider gets dragged and the user
     * wants to skip to a new position in the video stream.
     */
    _onSeekPosition : function()
    {
        this.player.seekTo(this.sliderField.getValue());
    },

    /**
     * Listener for the volume slider.
     */
    _onSetVolume : function()
    {
        this.muteButton.toggle(false);
        this.player.setVolume(this.volumeSlider.getValue());
    },

    /**
     * Listener for the mute button toggle event.
     * Since Ext3.0, Toolbars come with a layout manager which is capable of hiding
     * items if the containers enableOverfloe is set to true (defaults to true).
     * This method can either be called from a menu item in a more menu, or the
     * split button directly.
     *
     * @param {Ext.Toolbar.SplitButton}|{Ext.menu.Item}
     */
    _onMuteToggle : function(button)
    {
        var pressed = this.muteButton.pressed;
        var isMore  = false;
        if (button instanceof Ext.menu.Item) {
            isMore = true;
            pressed = !pressed;
        }

        if (pressed) {
            button.setIconClass('ext-ux-youtubeplayer-control-muteIcon');
            if (isMore) {
                this.muteButton.toggle(true);
                return;
            }
            this.player.mute(true);
        } else {
            button.setIconClass('ext-ux-youtubeplayer-control-volumeIcon');
            if (isMore) {
                this.muteButton.toggle(false);
                return;
            }
            this.player.mute(false);
        }

    },


    /**
     * Listener for the play button
     */
    _onPlay : function(button)
    {
        var state = this.player.getPlayerState();

        if (state == 'playing') {
            this.player.pauseVideo();
        } else if (state == 'paused' || state == 'video_cued') {
            this.player.playVideo();
        }
    },

    /**
     * Listener for the stop button.
     * This implementation will not directly stop the vide (i.e. unloading it),
     * but rather pause the video and reset its position to 0.
     */
    _onStop : function(button)
    {
        this.player.pauseVideo();
        this.player.seekTo(0);
        this.stopButton.setDisabled(true);

        this._updateVideoInfo.defer(100, this, [true]);
    },

    /**
     * Inits this component.
     */
    initComponent : function()
    {
        var tb = Ext.Toolbar.Button;

        this.ejectButton = new tb({
            iconCls  : 'eject',
            disabled : true
        });

        this.playButton = new tb({
            iconCls : 'play',
            disabled : true
        });

        this.stopButton = new tb({
            iconCls : 'stop',
            disabled : true
        });

        this.previousButton = new tb({
            iconCls : 'start',
            disabled : true
        });

        this.nextButton = new tb({
            iconCls : 'end',
            disabled : true
        });

        this.qualityHd720Item = new Ext.menu.CheckItem({
            text     : '720p',
            group    : 'quality',
            disabled : true
        });

        this.qualityLargeItem = new Ext.menu.CheckItem({
            text     : '480p',
            group    : 'quality',
            disabled : true
        });

        this.qualityMediumItem = new Ext.menu.CheckItem({
            text     : '360p',
            group    : 'quality',
            disabled : true
        });

        this.qualitySmallItem = new Ext.menu.CheckItem({
            text     : '< 360p',
            group    : 'quality',
            disabled : true
        });

        this.qualityAutoItem = new Ext.menu.CheckItem({
            text    : 'Auto',
            checked : true
        });

        this.qualityButton = new Ext.Button({
            iconCls : 'quality',
            menu    : [
                this.qualityHd720Item,
                this.qualityLargeItem,
                this.qualityMediumItem,
                this.qualitySmallItem,
                '-',
                this.qualityAutoItem
            ]
        });

        this.volumeSlider = new Ext.Slider({
            minValue : 0,
            maxValue : 100,
            width    : 110,
            disabled : true
        });

        this.sliderField = new Ext.ux.YoutubePlayer.Control.Slider({
            minValue   : 0,
            maxValue   : 0,
            disabled   : true,
            listeners  : {
                render : function() {
                    this.el.dom.parentNode.style.width = '100%';
                }
            }
        });

        this.muteButton = new Ext.Toolbar.SplitButton({
                iconCls      : 'ext-ux-youtubeplayer-control-volumeIcon',
                enableToggle : true,
                disabled     : true,
                width        : 36,
                menu         : new Ext.menu.Menu({
                    enableScrolling : false,
                    plain           : true,
                    showSeparator   : false,
                    items           : [this.volumeSlider]
                }),
                handler : this._onMuteToggle,
                scope   : this
        });

        this.elRuntime = new Ext.Toolbar.TextItem({text:"00:00"});

        Ext.apply(this, {
            cls   : 'ext-ux-youtubeplayer-control',
            items : [
                this.ejectButton,
                this.playButton,
                this.stopButton,
                this.previousButton,
                this.nextButton,
                ' ',
                this.sliderField,
                ' ',
                this.elRuntime,
                new Ext.Toolbar.Spacer(),
                this.qualityButton,
                this.muteButton
            ]
        });

        Ext.ux.YoutubePlayer.Control.superclass.initComponent.call(this);

        this.on('beforerender', this._initListeners, this);

        this.player.on('ready', function() {
            this.ejectButton.setDisabled(false);
        }, this);
    },

    /**
     * Inits the listener for this control.
     *
     */
    _initListeners : function()
    {
        // hack for working around the overflow functionality - if the method
        // does not get altered, the mute button would not get rendered properly all the time
        this.on('afterlayout', function() {
            this.getLayout().onLayout = this.getLayout().onLayout.createInterceptor(function() {
                this.container.sliderField.el.dom.parentNode.style.width ="1px";
            });

            this.getLayout().onLayout = this.getLayout().onLayout.createSequence(function() {
                this.container.sliderField.el.dom.parentNode.style.width ='100%';
            });
        }, this, {single : true});

        this.muteButton.menu.on('beforeshow', function(){
            var state = this.player.getState();
            if (state != 'ended' && state != 'unstarted') {
                this.volumeSlider.setDisabled(false);
                this.volumeSlider.setValue(this.player.getVolume(), false);
            }
        }, this);

        this.playButton.on('click', this._onPlay, this);
        this.stopButton.on('click', this._onStop, this);
        this.muteButton.on('toggle', this._onMuteToggle, this);
        this.on('hide', this._onHide, this);
        this.on('destroy', this._onDestroy, this);
        var c = this;
        this.player.on('stateChange', function(state, panel, player){c._processPlayerEvents.defer(1, c, [state, panel, player]);}, this);
        this.sliderField.on('dragstart', function(){this.isAdjusting = true;}, this);
        this.sliderField.on('drag', this._onSeekPosition, this);
        this.sliderField.on('dragend', function(){this.isAdjusting = false;}, this);
        this.volumeSlider.on('drag', this._onSetVolume, this);
        this.player.on('error', this._onError, this);
        this.ejectButton.on('click', this._onEject, this);

        this.qualitySmallItem.on('checkchange', this._onQualityItemCheckChange, this);
        this.qualityMediumItem.on('checkchange', this._onQualityItemCheckChange, this);
        this.qualityLargeItem.on('checkchange', this._onQualityItemCheckChange, this);
        this.qualityHd720Item.on('checkchange', this._onQualityItemCheckChange, this);
        this.qualityAutoItem.on('checkchange', this._onQualityItemCheckChange, this);
    },

    /**
     * Stops the task manager, removes the fx element and destroys the volume
     * panel.
     */
    _onDestroy : function()
    {
        if (this.task) {
            Ext.TaskMgr.stop(this.task);
        }
    },

    /**
     * Updates the menu items representing the quality levels of the crrently
     * playing video.
     *
     * @param {Array} levels An array with any of the following values:
     * small, medium, large, hd720
     */
    _updateAvailableQualityLevels : function(levels)
    {
        this.qualitySmallItem.setDisabled(levels.indexOf('small') == -1);
        this.qualityMediumItem.setDisabled(levels.indexOf('medium') == -1);
        this.qualityLargeItem.setDisabled(levels.indexOf('large') == -1);
        this.qualityHd720Item.setDisabled(levels.indexOf('hd720') == -1);

    },

    /**
     * Sets the quality of the video based on the chosen quality settings.
     *
     * @param {Array} levels An array with any of the following values:
     * small, medium, large, hd720
     */
    _autoAdjustQualityLevel : function(levels)
    {
        // first, check if autoQuality is activated.
        if (this.qualityAutoItem.checked) {
            this.player.setPlaybackQuality('default');
        } else {

            if (this.qualitySmallItem.checked) {
                this.player.setPlaybackQuality('small');
                return;
            }

            if (this.qualityMediumItem.checked) {
                this.player.setPlaybackQuality('medium');
                return;
            }

            if (this.qualityLargeItem.checked) {
                this.player.setPlaybackQuality('large');
                return;
            }

            if (this.qualityHd720Item.checked) {
                this.player.setPlaybackQuality('hd720');
                return;
            }
        }
    },

    /**
     * Checks the menu item for the quality level based on the passed argument.
     * Will not fire any events from the menu items.
     *
     * @apram {String} level any of "small", "medium", "large", "hd720".
     */
    _updateCurrentQualityItem : function(level)
    {
        this.qualitySmallItem.setChecked(false, true);
        this.qualityMediumItem.setChecked(false, true);
        this.qualityLargeItem.setChecked(false, true);
        this.qualityHd720Item.setChecked(false, true);

        switch (level) {
            case 'small':
                this.qualitySmallItem.setChecked(true, true);
            break;

            case 'medium':
                this.qualityMediumItem.setChecked(true, true);
            break;

            case 'large':
                this.qualityLargeItem.setChecked(true, true);
            break;

            case 'hd720':
                this.qualityHd720Item.setChecked(true, true);
            break;
        }
    },

    /**
     * Called when a quality menu items has been checked/unchecked.
     *
     * @param {Ext.menu.Item} item
     * @param {Boolean} checked
     */
    _onQualityItemCheckChange : function(item, checked)
    {
        switch (item) {
            case this.qualitySmallItem:
                this.player.setPlaybackQuality('small');
            break;

            case this.qualityMediumItem:
                this.player.setPlaybackQuality('medium');
            break;

            case this.qualityLargeItem:
                this.player.setPlaybackQuality('large');
            break;

            case this.qualityHd720Item:
                this.player.setPlaybackQuality('hd720');
            break;

            case this.qualityAutoItem:
                if (checked) {
                    this.player.setPlaybackQuality('default');
                }
            break;

        }
    },

    /**
     * Callback for the task querying the player's state every 500 ms.
     * Note that in mozilla, a maximize or collapse of a window the player sits
     * in will reload the whole movie under certain circumstances, thus resultig in
     * the current task runnning to be invalid. The task will check for a valid
     * player-instance and end itself if none found.
     *
     * @param {Boolean} ignorePaused if set to true and the player is paused,
     * only the progress bg of the sliderField will be updated, in case the video
     * is still buffering
     */
    _updateVideoInfo : function(ignorePaused)
    {
        if (!this.player.playerAvailable()) {
            this._processPlayerEvents('ended', this.player, null);
            return;
        }

        var player = this.player;
        var slider = this.sliderField;

        var loaded = player.getVideoBytesLoaded();

        if (loaded != -1) {
            slider.updateSliderBg(
                Math.floor((slider.getWidth()/100)*
                Math.floor(((loaded/player.getVideoBytesTotal())*100)))
            );
        }

        if (ignorePaused !== true && player.getPlayerState() == 'paused') {
            return;
        }

        var currentTime = Math.max(0, player.getCurrentTime());
        var totalTime   = Math.max(0, player.getDuration());

        if (totalTime != 0) {
            var rem = Math.floor(totalTime - currentTime);

            var minutes = Math.max(0, Math.floor(rem / 60));
            var seconds = Math.max(0, (rem%60));
            this.elRuntime.setText((minutes < 10 ? '0'+minutes : minutes)+':'+(seconds < 10 ? '0'+seconds : seconds));

            this.sliderField.maxValue = totalTime;

            if (!this.isAdjusting) {
                this.sliderField.setValue(currentTime, false);
            }
        }
    },

    /**
     * Gateway for the player events.
     */
    _processPlayerEvents : function(state, panel, player)
    {
        switch (state) {
            case 'unstarted':
                this._un = true;

                if (this.task) {
                    Ext.TaskMgr.stop(this.task);
                    this.task = null;
                }
            break;

            case 'ended':
                if (this.task) {
                    Ext.TaskMgr.stop(this.task);
                    this.task = null;
                }
                this.playButton.setIconClass('play');
                this.sliderField.setValue(0);
                this.sliderField.setDisabled(true);
                this.sliderField.updateSliderBg(0);
                this.elRuntime.setText("00:00");
                if (this.volumeField) {
                    this.volumeField.setDisabled(true);
                }
                this.playButton.setDisabled(true);
                this.stopButton.setDisabled(true);
                this.muteButton.setDisabled(true);

                if (panel.videoId && !this._un) {
                    this._un = true;
                    panel.cueVideoById(panel.videoId, 0);
                }
            break;

            case 'playing':

                this._updateCurrentQualityItem(player.getPlaybackQuality());

                if (!this.task) {

                    var levels = panel.getAvailableQualityLevels();
                    this._updateAvailableQualityLevels(levels);
                    this._autoAdjustQualityLevel(levels);

                    var c = this;
                    this.task = {
                        run: function(){
                           c._updateVideoInfo();
                        },
                        interval: 500
                    };
                    Ext.TaskMgr.start(this.task);
                }

                this._un = false;
                this.sliderField.setDisabled(false);
                if (this.volumeField) {
                    this.volumeField.setDisabled(false);
                }
                this.playButton.setIconClass('pause');
                this.playButton.setDisabled(false);
                this.stopButton.setDisabled(false);
                this.muteButton.setDisabled(false);
            break;

            case 'paused':
                this.playButton.setIconClass('play');
            break;

            case 'buffering':
            break;

            case 'video_cued':
                this.playButton.setDisabled(false);
            break;

            case 'unknown':
            break;

        }
    }



});

/**
 * @class Ext.ux.YoutubePlayer.Control.Slider
 * @extends Ext.Slider
 * Slider which supports showing the loading progress of a youtube video
 */
Ext.ux.YoutubePlayer.Control.Slider = Ext.extend(Ext.Slider, {

    cls : 'ext-ux-youtubeplayer-control-slider',

    // private override
    onRender : function()
    {
        Ext.ux.YoutubePlayer.Control.Slider.superclass.onRender.apply(this, arguments);

        this.progress = document.createElement('div');
        this.progress.className = 'hbar';
        this.el.dom.appendChild(this.progress);
    },

    updateSliderBg : function(percentage)
    {
        this.progress.style.backgroundPosition = '-'+(1280-percentage)+'px 0';
    }
});