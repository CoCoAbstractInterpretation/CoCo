var jamakFlix = {
  const: {
    server: "https://jamakflix.herokuapp.com/api/",
    fixTimingOptions: [
      23976,
      23980,
      24000,
      25000,
      29970,
      30000,
      50000,
      59940,
      60000
    ]
  },
  options: {
    notInitialized: true,
    language: "kor"
  },
  current: {
    seeking: false,
    enabled: false,
    delay: 0,
    recommendedDelay: 0,
    fixTiming: false,
    subtitleId: null,
    subtitles: null,
    episode: null,
    season: null,
    videoId: null,
    videoAncestorId: null,
    pendingEvents: {}
  },
  hasReportedCurrentSub: function () {
    if (!jamakFlix.current.videoId || !jamakFlix.current.subtitleId) {
      return;
    }
    var reportedStr = localStorage["jamakFlix-reported"];
    if (reportedStr) {
      if (JSON.parse(reportedStr).indexOf(jamakFlix.current.videoId + "/" + jamakFlix.current.subtitleId) > -1) {
        return true;
      }
    }
    return false;
  },
  reportCurrentSub: function () {
    if (!jamakFlix.current.videoId ||
      !jamakFlix.current.subtitleId ||
      jamakFlix.hasReportedCurrentSub() ||
      !$("video").length) {
      return;
    }

    $("video")[0].pause();
    if (!confirm("잘못된 자막을 신고할까요?")) {
      return;
    }

    $.ajax({
      url: jamakFlix.const.server + "report/" + jamakFlix.current.videoId + "/" + jamakFlix.current.subtitleId,
      type: "POST",
    });
    var reportedStr = localStorage["jamakFlix-reported"];
    var reported = [];
    if (reportedStr) {
      reported = JSON.parse(reportedStr);
    }
    reported.push(jamakFlix.current.videoId + "/" + jamakFlix.current.subtitleId);
    localStorage["jamakFlix-reported"] = JSON.stringify(reported);
    toastr.info("신고 감사합니다. Ctrl+L 을 누르시면 다시 자막을 찾기 시도할수 있습니다.")
    $("#jamakflix-report-subtitle").remove();
  },
  getDelay: function () {
    if (!jamakFlix.current.subtitleId) {
      return;
    }
    $.ajax({
      url: jamakFlix.const.server + "timing/" + jamakFlix.current.subtitleId,
      success: function (response) {
        jamakFlix.current.delay = response.delay;
        jamakFlix.current.recommendedDelay = response.delay;
      }
    });
  },
  updateDelay: function () {
    if (!jamakFlix.current.subtitleId) {
      return;
    }
    $.ajax({
      url: jamakFlix.const.server + "timing/" + jamakFlix.current.subtitleId,
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        delay: jamakFlix.current.delay
      }),
      type: "POST"
    });
  },
  autoLoadSubtitle: function () {
    $.ajax({
      url: jamakFlix.const.server + "sub",
      data: {
        l: jamakFlix.options.language,
        e: jamakFlix.current.episode,
        s: jamakFlix.current.season,
        curId: jamakFlix.current.videoId,
        showId: jamakFlix.current.videoAncestorId
      },
      success: function (res) {
        console.log(res);
        if (res.subtitle && res.subtitle.subtitles && res.subtitle.subtitles.length) {
          jamakFlix.current.subtitles = res.subtitle.subtitles;
          jamakFlix.current.subtitleId = res.info.id;
          jamakFlix.current.subtitles.unshift({ start: 0, end: 0 })
          var filename;
          try {
            filename = res.info.filename;
          } catch (err) {
            filename = "unknown";
          }
          jamakFlix.getDelay();
          toastr.success("자막 로딩 완료: " + filename);
          jamakFlix.current.enabled = true;
          jamakFlix.findCurrentIndex();

          if (!jamakFlix.hasReportedCurrentSub()) {
            $("html").append($("<div id='jamakflix-report-subtitle' class='jamakflix-ui hidden'>" +
              "<button type='button' onclick='jamakFlix.reportCurrentSub()'>잘못된 자막 신고</button>" +
              "<button type='button' onclick='jamakFlix.hideReportCurrentSub()'>닫기</button>" +
              "</div>"));
          }
        } else {
          toastr.error("자막이 없답니다");
        }
      },
      error: function (a, b, c) {
        if (!c) {
          toastr.error("자막을 찾을수 없습니다")
        } else {
          toastr.error(c);
        }
      }
    });

  },
  hideReportCurrentSub: function () {
    $("#jamakflix-report-subtitle").remove();
  },
  initializeUi: function () {
    const $target = $("div.sizing-wrapper");
    if($target.length === 0){
      $target = $("html");
    }
    $target.append('<div id="jamakflix-subtitle"></div>')
  },
  getCurrentVideoTime: function () {
    //return ms
    if (!$("video").length) return;
    if (!jamakFlix.current.fixTiming) {
      return ($("video")[0].currentTime * 1000) + jamakFlix.current.delay;
    }
    var fixed = $("video")[0].currentTime / 30 * jamakFlix.current.fixTiming;
    return fixed + jamakFlix.current.delay;
  },
  bindKeyboardEvents: function () {
    $(window).on("keydown", function (e) {
      switch (e.keyCode) {
        case (188): // ,<
          e.preventDefault();
          jamakFlix.updateSync(e.ctrlKey ? -1000 : -100);
          return false;
          break;
        case (190): // .>
          e.preventDefault();
          jamakFlix.updateSync(e.ctrlKey ? 1000 : 100);
          return false;
          break;
        case (191): // /?
          e.preventDefault();
          jamakFlix.updateSync(e.ctrlKey ? 0 : jamakFlix.current.recommendedDelay, true);
          return false;
          break;
        case (76): // o
          if (e.ctrlKey) {
            e.preventDefault();
            jamakFlix.onEnterNewPage(0, true);
            return false;
          }
          break;
      }
    });
  },
  updateSync: function (value, hard) {
    if (!jamakFlix.current.enabled) {
      return;
    }
    if (hard) {
      jamakFlix.current.delay = value;
    } else {
      jamakFlix.current.delay += value;
    }
    jamakFlix.findCurrentIndex();
    toastr.info("자막싱크:" + parseInt(jamakFlix.current.delay / 100) / 10 + "초")
    window.clearTimeout(jamakFlix.current.pendingEvents.updateDelay);
    jamakFlix.current.pendingEvents.updateDelay = (window.setTimeout(function () {
      delete jamakFlix.current.pendingEvents.updateDelay;
      jamakFlix.updateDelay();
    }, 60000));
  },
  bindVideoEvents: function () {
    if (!$("video").length || $("video").data("jamakFlixEventsBound")) {
      return;
    }
    $("video").on("timeupdate", function () {
      var curTime = jamakFlix.getCurrentVideoTime();
      if (!jamakFlix.current.enabled) return;
      if (curTime < jamakFlix.current.subtitles[jamakFlix.current.currentIndex].end) {
        $("#jamakflix-subtitle").html(jamakFlix.current.subtitles[jamakFlix.current.currentIndex].content);
      } else {
        if (curTime > jamakFlix.current.subtitles[jamakFlix.current.currentIndex].end) {
          $("#jamakflix-subtitle").html("");
          if (!jamakFlix.current.subtitles[jamakFlix.current.currentIndex + 1]) {
            // uiVisible();
          } else if (curTime > jamakFlix.current.subtitles[jamakFlix.current.currentIndex + 1].start) {
            jamakFlix.current.currentIndex++;
          }
        }
      }

    }).on("seeked", function () {
      jamakFlix.current.seeking = false;
      jamakFlix.findCurrentIndex();
    }).on("seeking", function () {
      jamakFlix.current.seeking = true;
    }).on("pause", function () {
      $(".jamakflix-ui").removeClass("hidden");
    }).on("play", function () {
      jamakFlix.findCurrentIndex();
      $(".jamakflix-ui").addClass("hidden");
    });
    $("video").data("jamakFlixEventsBound", true);
  },
  findCurrentIndex: function () {
    if (!jamakFlix.current.enabled || !jamakFlix.current.subtitles || !jamakFlix.current.subtitles.length) {
      return
    }
    for (var i = jamakFlix.current.subtitles.length - 1; i > 0; i--) {
      if (jamakFlix.current.subtitles[i].start < jamakFlix.getCurrentVideoTime()) {
        jamakFlix.current.currentIndex = i;
        return
      }
    }
    jamakFlix.current.currentIndex = 0;
  },
  loadVideoInformation: async function () {
    jamakFlix.current.episode = null;
    jamakFlix.current.season = null;
    jamakFlix.current.videoId = null;
    jamakFlix.current.videoAncestorId = null;
    try {
      var currentVidId = parseInt(window.location.pathname.replace("/watch/", ""));
      const info = await jamakFlix.fetchNetflixInfo(currentVidId)
      if(info.summary.value.type === "show"){
        jamakFlix.current.videoAncestorId = currentVidId;
        jamakFlix.current.videoId = info.current.value[1];
        const curInfo = await jamakFlix.fetchNetflixInfo(info.current.value[1])
        jamakFlix.current.season = curInfo.summary.value.season;
        jamakFlix.current.episode = curInfo.summary.value.episode;
      }else if (info.summary.value.type === "episode"){
        jamakFlix.current.videoId = currentVidId;
        jamakFlix.current.videoAncestorId = info.ancestor.value[1];
        jamakFlix.current.episode = info.summary.value.episode;
        jamakFlix.current.season = info.summary.value.season;
      }else{
        jamakFlix.current.videoAncestorId = currentVidId;
        jamakFlix.current.videoId = currentVidId;
      }
      
      return true;
    } catch (error) {
      console.warn(error)
    }
    return false;
  },
  fetchNetflixInfo: async function(videoid){
      const fields = (e => [
          ["videos",
              e += "",
              "boxarts",
              [
                  "_1920x1080",
                  "_342x192",
                  "_342x684",
                  "_112x63"
              ],
              "jpg"
          ],
          [
              "videos",
              [e],
              [
                  "availability",
                  "subtitles",
                  "audio",
                  "title",
                  "summary",
                  "ancestor",
                  "current"
              ]
          ],
      ]);
      

      if(!videoid){
      videoid = parseInt(window.location.pathname.replace("/watch/", ""))
      }

      const url = `/nq/website/memberapi/${window.netflix.reactContext.models.serverDefs.data.BUILD_IDENTIFIER}/pathEvaluator?webp=true&drmSystem=widevine&isVolatileBillboardsEnabled=true&routeAPIRequestsThroughFTL=false&isTop10Supported=true&falcor_server=0.1.0&withSize=true&materialize=true&original_path=%2Fshakti%2Fvf10970d2%2FpathEvaluator`
      const body = fields(videoid).map(t => encodeURIComponent("path") + "=" + encodeURIComponent(JSON.stringify(t))).join("&");
      const result = await fetch(
          url,
          {
              method: "POST",
              credentials: "include",
              body: body,
              headers: {
                  "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
              }
          });
      const jsonresult = await result.json();
      return jsonresult.jsonGraph.videos[videoid];
},

  askToDisplaySubtitle: function (remove, alert) {
    if (jamakFlix.current.pendingEvents.hideAskingButtons) {
      window.clearTimeout(jamakFlix.current.pendingEvents.hideAskingButtons);
      delete jamakFlix.current.pendingEvents.hideAskingButtons;
    }
    if (remove) {
      if (alert) {
        toastr.info("Ctrl+L 을 누르시면 자막을 로드할수 있습니다.")
      }
      $("#jamakflix-ask-subtitle").remove();
      return;
    }
    $("html").append($("<div id='jamakflix-ask-subtitle' class='jamakflix-ui hidden visible'>" +
      "<button type='button' onclick='jamakFlix.onEnterNewPage(0,true)'>자막 찾기</button>" +
      "<button type='button' onclick='jamakFlix.askToDisplaySubtitle(true,true);'>닫기</button>" +
      "</div>"));
    jamakFlix.current.pendingEvents.hideAskingButtons = window.setTimeout(function () {
      delete jamakFlix.current.pendingEvents.hideAskingButtons;
      $("#jamakflix-ask-subtitle").removeClass("visible");
    }, 6000);
  },
  wrapUp: function () {
    jamakFlix.current.enabled = false;
    $("#jamakflix-subtitle").remove();
    $(".jamakflix-ui").remove();
  },
  onEnterNewPage: function (trycount, hard) {
    $(".jamakflix-ui").remove();
    jamakFlix.current.delay = 0;
    jamakFlix.current.recommendedDelay = 0;
    jamakFlix.current.subtitleId = null;

    for (var k in jamakFlix.current.pendingEvents) {
      window.clearTimeout(jamakFlix.current.pendingEvents[k]);
    }

    if (!window.location.pathname.startsWith("/watch/")) {
      jamakFlix.wrapUp();
      return;
    }

    if (jamakFlix.options.notInitialized) {
      window.setTimeout(function () {
        jamakFlix.onEnterNewPage(trycount + 1)
      }, 250);
      return;
    }

    jamakFlix.bindVideoEvents();

    if (hard) {
      jamakFlix.askToDisplaySubtitle(true);
    } else {
      if (jamakFlix.options.enabled === "ask") {
        jamakFlix.askToDisplaySubtitle();
      }
      if (jamakFlix.options.enabled !== "always") {
        return;
      }
    }

    if (!trycount) {
      trycount = 1;
    }
    if (trycount > 30) {
      toastr.error("넷플릭스 영상 정보를 읽어오지 못했습니다. 페이지를 새로고침 해보세요.");
      return;
    }

    const retry = ()=>{
      window.setTimeout(function () {
        jamakFlix.onEnterNewPage(trycount + 1)
      }, 250);
    }

    if (!$("video").length) {
      retry();
      return;
    }

    jamakFlix.loadVideoInformation().then((success)=>{
      if(success){
        jamakFlix.initializeUi();
        toastr.info("자막Flix 서버에서 자막을 찾는 중입니다");
        jamakFlix.autoLoadSubtitle();
      }else{
        retry();
        return;
      }
    }).catch(()=>{
      retry();
      return;
    })
  },
  initialize: function () {
    window.addEventListener("message", function (event) {
      if (event.data.jamakFlix && event.data.type) {
        if (event.data.type == "update") {
          jamakFlix.options = event.data.settings;
        }
      }
    }, false);
    window.postMessage({
      type: "get",
      jamakFlix: true
    }, "*");

    jamakFlix.bindKeyboardEvents();
    jamakFlix.current.location = window.location.pathname;
    setInterval(function () {
      if (jamakFlix.current.location !== window.location.pathname) {
        jamakFlix.current.location = window.location.pathname;
        jamakFlix.onEnterNewPage();
      }
    }, 100);

    if (window.location.pathname.startsWith("/watch/")) {
      jamakFlix.onEnterNewPage();
    }
  }
};
window.setTimeout(function () {
  jamakFlix.initialize();
}, 1000);