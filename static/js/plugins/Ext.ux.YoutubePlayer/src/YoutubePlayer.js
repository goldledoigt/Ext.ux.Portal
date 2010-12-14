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
}