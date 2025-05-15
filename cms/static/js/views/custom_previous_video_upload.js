define(
    ['underscore', 'gettext', 'js/utils/date_utils', 'js/views/baseview', 'common/js/components/views/feedback_prompt',
        'common/js/components/views/feedback_notification', 'js/views/video_thumbnail', 'js/views/video_transcripts',
        'js/views/video_status', 'common/js/components/utils/view_utils', 'edx-ui-toolkit/js/utils/html-utils',
        'text!templates/custom-previous-video-upload.underscore'],
    function(_, gettext, DateUtils, BaseView, PromptView, NotificationView, VideoThumbnailView, VideoTranscriptsView,
        VideoStatusView, ViewUtils, HtmlUtils, previousVideoUploadTemplate) {
        'use strict';

        var PreviousVideoUploadView = BaseView.extend({
            tagName: 'div',

            className: 'video-row',

            events: {
                'click .remove-video-button.action-button': 'removeVideo',
                'click .copy-button.btn-outline-primary.btn': 'copyVideo'  // Added by NILESH DATANIYA
            },

            initialize: function(options) {
                this.template = HtmlUtils.template(previousVideoUploadTemplate);
                this.videoHandlerUrl = options.videoHandlerUrl;
                this.videoImageUploadEnabled = options.videoImageSettings.video_image_upload_enabled;

                if (this.videoImageUploadEnabled) {
                    this.videoThumbnailView = new VideoThumbnailView({
                        model: this.model,
                        imageUploadURL: options.videoImageUploadURL,
                        defaultVideoImageURL: options.defaultVideoImageURL,
                        videoImageSettings: options.videoImageSettings
                    });
                }
                this.videoTranscriptsView = new VideoTranscriptsView({
                    transcripts: this.model.get('transcripts'),
                    edxVideoID: this.model.get('edx_video_id'),
                    edxVideoURL: this.model.get('edx_video_url'), // Added by NILESH DATANIYA
                    clientVideoID: this.model.get('client_video_id'),
                    transcriptionStatus: this.model.get('transcription_status'),
                    errorDescription: this.model.get('error_description'),
                    transcriptAvailableLanguages: options.transcriptAvailableLanguages,
                    videoSupportedFileFormats: options.videoSupportedFileFormats,
                    videoTranscriptSettings: options.videoTranscriptSettings
                });

                this.VideoStatusView = new VideoStatusView({
                    status: this.model.get('status'),
                    showError: !this.model.get('transcription_status'),
                    errorDescription: this.model.get('error_description')
                });
            },

            render: function() {
                var renderedAttributes = {
                    videoImageUploadEnabled: this.videoImageUploadEnabled,
                    created: DateUtils.renderDate(this.model.get('created')),
                    status: this.model.get('status')
                };
                HtmlUtils.setHtml(
                    this.$el,
                    this.template(
                        _.extend({}, this.model.attributes, renderedAttributes)
                    )
                );

                if (this.videoImageUploadEnabled) {
                    this.videoThumbnailView.setElement(this.$('.thumbnail-col')).render();
                }
                this.videoTranscriptsView.setElement(this.$('.transcripts-col')).render();
                this.VideoStatusView.setElement(this.$('.status-col')).render();

                // enable URL copy button if status is uploaded : NILESH DATANIYA
                status = this.model.get('status');
                if (status === 'Uploaded'){
                    this.$('#video-copy-button').removeAttr('disabled');
                }
                return this;
            },

            removeVideo: function(event) {
                var videoView = this;
                event.preventDefault();

                ViewUtils.confirmThenRunOperation(
                    gettext('Are you sure you want to remove this video from the list?'),
                    gettext('Removing a video from this list does not affect course content. Any content that uses a previously uploaded video ID continues to display in the course.'), // eslint-disable-line max-len
                    gettext('Remove'),
                    function() {
                        ViewUtils.runOperationShowingMessage(
                            gettext('Removing'),
                            function() {
                                return $.ajax({
                                    url: videoView.videoHandlerUrl + '/' + videoView.model.get('edx_video_id'),
                                    type: 'DELETE'
                                }).done(function() {
                                    videoView.remove();
                                });
                            }
                        );
                    }
                );
            // Added by NILESH DATANIYA
            },
            copyVideo: function(event) {
                var copyvideoView = '#'+ this.model.get('edx_video_id');
                event.preventDefault();
                var $temp = $("<input>");
                $("body").append($temp);
                $temp.val($(copyvideoView).text()).select();
                document.execCommand("copy");
                $temp.remove();
            }
        });

        return PreviousVideoUploadView;
    }
);
