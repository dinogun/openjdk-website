// When releases page loads, run:
function onReleasesLoad() {
  const OS = detectOS();
  setReleasesButtons();

  const archive = document.getElementById('archives-page');
  const latest = document.getElementById('latest-page');

  if(window.location.hash == "#archive") {
    showArchive();
  } else {
    hideArchive();
  }

  function showArchive() {
    latest.className += " hide";
    archive.className = archive.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
    populateArchive();
  }

  function hideArchive() {
    archive.className += " hide";
    latest.className = latest.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
    populateLatest();
  }

  window.onhashchange = function(){
    if(window.location.hash == "#archive") {
      showArchive();
    } else {
      hideArchive();
    }
  }
}

// BOTH PAGES FUNCTIONS

function setReleasesButtons() {
  const archiveButton = document.getElementById('archive-button');
  const latestButton = document.getElementById('latest-button');
  const nightlyButton = document.getElementById('nightly-button');

  archiveButton.onclick = function() {
    window.location.href = './releases#archive';
  }

  latestButton.onclick = function() {
    window.location.href = './releases';
  }

  nightlyButton.onclick = function() {
    window.location.href = './nightly';
  }
}

// LATEST PAGE FUNCTIONS

function populateLatest() {

  var loading = document.getElementById("latest-loading");

  loadReleasesJSON("openjdk-releases", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0];
    }

    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases...
    if (typeof releasesJson[0] !== 'undefined') {
      // remove the loading dots
      document.getElementById("latest-loading").innerHTML = "";

      // populate the page with the release's information
      var publishedAt = (releasesJson[0].published_at);
      document.getElementById("latest-build-name").innerHTML = releasesJson[0].name;
      document.getElementById("latest-build-name").href = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + releasesJson[0].name);
      document.getElementById("latest-date").innerHTML = moment(publishedAt).format('Do MMMM YYYY');
      document.getElementById("latest-changelog").href = releasesJson[0].name;
      document.getElementById("latest-timestamp").innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
      document.getElementById("latest-buildnumber").innerHTML = releasesJson[0].id;
      document.getElementById("latest-commitref").innerHTML = releasesJson[0].name;
      document.getElementById("latest-commitref").href = releasesJson[0].name;

      // create an array of the details for each binary that is attached to a release
      var assetArray = [];
      var assetCounter = 0;
      releasesJson[0].assets.forEach(function() {
        assetArray.push(releasesJson[0].assets[assetCounter]);
        assetCounter++;
      });

      // build the download links section with these binaries
      var linuxDlButton = document.getElementById("linux-dl-button");
      var windowsDlButton = document.getElementById("windows-dl-button");
      var macDlButton = document.getElementById("mac-dl-button");
      var linuxPlatformBlock = document.getElementById("latest-linux");
      var windowsPlatformBlock = document.getElementById("latest-windows");
      var macPlatformBlock = document.getElementById("latest-mac");

      assetCounter2 = 0;
      assetArray.forEach(function() {     // iterate through the binaries attached to this release
        var nameOfFile = (assetArray[assetCounter2].name);
        var a = nameOfFile.toUpperCase();
        // set the download links for this release
        if(a.indexOf("LINUX") >= 0) {
          document.getElementById("latest-size-linux").innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
          document.getElementById("latest-checksum-linux").href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");

          var linuxLink = (assetArray[assetCounter2].browser_download_url);
          linuxDlButton.onclick = function() {
            window.location.href = linuxLink;
          }
          linuxPlatformBlock.className = linuxPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

        } else if(a.indexOf("WIN") >= 0) {
          document.getElementById("latest-size-windows").innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
          document.getElementById("latest-checksum-windows").href = (assetArray[assetCounter2].browser_download_url).replace("zip", "txt");

          var windowsLink = (assetArray[assetCounter2].browser_download_url);
          windowsDlButton.onclick = function() {
            window.location.href = windowsLink;
          }
          windowsPlatformBlock.className = windowsPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

        } else if(a.indexOf("MAC") >= 0) {
          document.getElementById("latest-size-mac").innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
          document.getElementById("latest-checksum-mac").href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");

          var macLink = (assetArray[assetCounter2].browser_download_url);
          macDlButton.onclick = function() {
            window.location.href = macLink;
          }
          macPlatformBlock.className = macPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
        }
        assetCounter2++;
      });

      const latestContainer = document.getElementById("latest-container");
      latestContainer.className += " animated fadeIn";
      latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

    } else {
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      document.getElementById("latest-loading").innerHTML = "";
    }
  });
}



// ARCHIVE PAGE FUNCTIONS

function populateArchive() {
  const archiveList = document.getElementById("archive-list");
  var loading = document.getElementById("archive-loading");

  loadReleasesJSON("openjdk-releases", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0];
    }

    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases prior to the latest one...
    if (typeof releasesJson[1] !== 'undefined') {
      // remove the loading dots
      document.getElementById("archive-loading").innerHTML = "";

      // for each release...
      var archiveCounter = 0;
      releasesJson.forEach(function() {

        // get the current content of the archive list div
        var currentArchiveContent = archiveList.innerHTML;
        // add an empty, hidden entry to the archive list, with the archiveCounter suffixed to every ID
        var newArchiveContent = currentArchiveContent += ("<div class='archive-container hide' id='"+archiveCounter+"'><div class='archive-header blue-bg vertically-center-parent'><div class='vertically-center-child full-width'><div><h1><a href='' id='archive-release"+archiveCounter+"' class='light-link' target='blank'></a></h1></div><div id='archive-date"+archiveCounter+"'></div></div></div><div class='archive-downloads vertically-center-parent'><div class='archive-downloads-container vertically-center-child'><div id='linux-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>Linux</div><a class='grey-button no-underline' href='' id='archive-linux-dl"+archiveCounter+"'>tar.gz (<span id='archive-linux-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-linux-checksum"+archiveCounter+"'>Checksum</a></div><div id='windows-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>Windows</div><a class='grey-button no-underline' href='' id='archive-windows-dl"+archiveCounter+"'>.zip (<span id='archive-windows-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-windows-checksum"+archiveCounter+"'>Checksum</a></div><div id='mac-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>macOS</div><a class='grey-button no-underline' href='' id='archive-mac-dl"+archiveCounter+"'>tar.gz (<span id='archive-mac-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-mac-checksum"+archiveCounter+"'>Checksum</a></div></div></div><div class='archive-details align-left vertically-center-parent'><div class='vertically-center-child'><div><strong><a href='' class='dark-link' id='archive-changelog"+archiveCounter+"'>Changelog</a></strong></div><div><strong>Timestamp: </strong><span id='archive-timestamp"+archiveCounter+"'></span></div><div><strong>Build number: </strong><span id='archive-buildnumber"+archiveCounter+"'></span></div><div><strong>Commit: </strong><a href='' class='dark-link' id='archive-commitref"+archiveCounter+"'></a></div></div></div></div>");
        archiveList.innerHTML = newArchiveContent;
        // populate the new entry with that release's information
        var publishedAt = (releasesJson[archiveCounter].published_at);
        document.getElementById("archive-release"+archiveCounter).innerHTML = releasesJson[archiveCounter].name;
        document.getElementById("archive-release"+archiveCounter).href = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + releasesJson[archiveCounter].name);
        document.getElementById("archive-date"+archiveCounter).innerHTML = moment(publishedAt).format('Do MMMM YYYY');
        document.getElementById("archive-changelog"+archiveCounter).href = releasesJson[archiveCounter].name;
        document.getElementById("archive-timestamp"+archiveCounter).innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
        document.getElementById("archive-buildnumber"+archiveCounter).innerHTML = releasesJson[archiveCounter].id;
        document.getElementById("archive-commitref"+archiveCounter).innerHTML = releasesJson[archiveCounter].name;
        document.getElementById("archive-commitref"+archiveCounter).href = releasesJson[archiveCounter].name;

        // set the download button links
          // create an array of the details for each binary that is attached to a release
          var assetArray = [];
          var assetCounter = 0;
          releasesJson[archiveCounter].assets.forEach(function() {
            assetArray.push(releasesJson[archiveCounter].assets[assetCounter]);
            assetCounter++;
          });

          // build the download links section with these binaries
          var linuxDlButton = document.getElementById("archive-linux-dl"+archiveCounter);
          var windowsDlButton = document.getElementById("archive-windows-dl"+archiveCounter);
          var macDlButton = document.getElementById("archive-mac-dl"+archiveCounter);
          var linuxPlatformBlock = document.getElementById("linux-platform-block"+archiveCounter);
          var windowsPlatformBlock = document.getElementById("windows-platform-block"+archiveCounter);
          var macPlatformBlock = document.getElementById("mac-platform-block"+archiveCounter);

          assetCounter2 = 0;
          assetArray.forEach(function() {     // iterate through the binaries attached to this release
            var nameOfFile = (assetArray[assetCounter2].name);
            var a = nameOfFile.toUpperCase();
            // set the download links for this release
            if(a.indexOf("LINUX") >= 0) {
              document.getElementById("archive-linux-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              document.getElementById("archive-linux-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");

              var linuxLink = (assetArray[assetCounter2].browser_download_url);
              linuxDlButton.href = linuxLink;
              linuxPlatformBlock.className = linuxPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

            } else if(a.indexOf("WIN") >= 0) {
              document.getElementById("archive-windows-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              document.getElementById("archive-windows-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("zip", "txt");

              var windowsLink = (assetArray[assetCounter2].browser_download_url);
              windowsDlButton.href = windowsLink;
              windowsPlatformBlock.className = windowsPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

            } else if(a.indexOf("MAC") >= 0) {
              document.getElementById("archive-mac-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              document.getElementById("archive-mac-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");

              var macLink = (assetArray[assetCounter2].browser_download_url);
              macDlButton.href = macLink;
              macPlatformBlock.className = macPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
            }
            assetCounter2++;
          });

        // show the new entry
        var container = document.getElementById(archiveCounter);
        container.className += " animated fadeIn";
        container.className = container.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
        // iterate to the next archive entry
        archiveCounter++;

      });
    } else {
      // report an error
      errorContainer.innerHTML = "<p>Error... no archive releases have been found!</p>";
      document.getElementById("archive-loading").innerHTML = "";
    }
  });
}