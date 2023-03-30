// ========================================== Bắt đầu từ đây là sign-in google ============================================

var GoogleAuth;
var SCOPE = "https://www.googleapis.com/auth/spreadsheets";
var gettedToken = [];

function resets() {
  window.location.reload();
}

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load("client:auth2", initClient);
}

function getApi(url) {
  var patt = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  var key = url.match(patt);
  // console.log(gettedToken[0]);
  // link của thầy
    var arrHasAccessToken = '';
    arrHasAccessToken = gettedToken[0][Object.keys(gettedToken[0])[1]]
    if (typeof arrHasAccessToken == "undefined") {
      $(".popup").show();
      $(".popup p").html("Access token không hợp lệ!");
      $(".popup button").hide();
    }
    var url_api =
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      key[1] +
      "/values/Trang%20tính1?alt=json&access_token=" +
      arrHasAccessToken.access_token;
    return url_api;
  // var url_api = "https://sheets.googleapis.com/v4/spreadsheets/" + key[1] + "/values/Sheet1?alt=json&access_token=" + gettedToken[0].Zb.access_token;
  // console.log(gettedToken[0]);
  // return url_api;
}

var link_total_url_api;
function initClient() {
  // In practice, your app can retrieve one or more discovery documents.
  var discoveryUrl =
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

  // Initialize the gapi.client object, which app uses to make API requests.
  // Get API key and client ID from API Console.
  // 'scope' field specifies space-delimited list of access scopes.
  gapi.client
    .init({
      apiKey: "AIzaSyA-5v9hrBZt8gYxKqet-Of90cCPNLHGAnk", //C1
      clientId:
        "385356524753-f4bficgqsm0sb1ggfma7trp6bimp1bo8.apps.googleusercontent.com", //C2
      // for test
      // apiKey: "AIzaSyAkOofkfB6SnWkc-9Cd_hDW1liY-pa74G8",
      // clientId:
      //   "512677808993-fqbc14m6c6vu78dgggd2rtd1bfm1i003.apps.googleusercontent.com",
      discoveryDocs: [discoveryUrl],
      scope: SCOPE,
    })
    .then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(updateSigninStatus);

      // Handle initial sign-in state. (Determine if user is already signed in.)
      var user = GoogleAuth.currentUser.get();
      setSigninStatus();

      gettedToken.push(user);
      // console.log(user.Zb.access_token);

      // Call handleAuthClick function when user clicks on
      //      "Sign In/Authorize" button.
      $("#sign-in-or-out-button").click(function () {
        handleAuthClick();
      });
      $("#revoke-access-button").click(function () {
        revokeAccess();
      });

      //==================================================================================================================

      //console.log(gettedToken[0].Zb.access_token);

      // link của thầy
      var link_total_url =
        "https://docs.google.com/spreadsheets/d/1sx2NMPFL7QLPeRMAJvysJj82c74ARS1qMrgSfwc3Xcg/edit#gid=0"; //C3

      // link test
      // var link_total_url =
      //   "https://docs.google.com/spreadsheets/d/1QPvX386QHPydkT86ADu6PQyXHe1rtuuypsPxgnDgMDM/edit#gid=0";

      link_total_url_api = getApi(link_total_url);

      $.getJSON(link_total_url_api, function (data) {
        let mentorArr = [];
        let allTrackingUrl = [];
        let mentorArrDup = [];
        //lặp mảng url
        var arrData = data.values;

        //lặp từng mảng để lấy tên các mentor

        for (var i = 1; i < arrData.length; i++) {
          mentorArr.push(arrData[i][1]);
        }
        mentorArrDup = mentorArr.filter(function (item, index) {
          return mentorArr.indexOf(item) === index;
        });
        mentorArrDup.sort();
      }).done(() => (window.filterOnNewTab ? filter() : listAll()));

      function listAll() {
        let arrData;
        let pushArr = [];
        let allTrackingUrl = [];
        setStatusLoading();

        $.getJSON(link_total_url_api, function (data) {
          arrData = data.values;

          for (let i = 1; i < arrData.length; i++) {
            pushArr.push(arrData[i]);
          }
          for (let i = 0; i < pushArr.length; i++) {
            allTrackingUrl.push(pushArr[i][0]);
          }
        }).done(function (data, textStatus, xhr) {
          removeTableRows();
          clearTimeouts();
          callAPIOnInterval(5, allTrackingUrl, pushArr);
        });
      }
    });
}
// select class type
// localStorage.setItem("classType", 0);
// console.log(localStorage.getItem("classType"));
// let classType = 0;
$("#classType").on('change', function() {
  localStorage.setItem("classType", this.value);
  window.location.reload();
  // console.log(localStorage.getItem("classType"));
  // if (classType == 1) {
  //   window.location.href = "/tracking-hvcg/test-kid.html";
  // } else if (classType == 2) {
  //   window.location.href = "/tracking-hvcg/test-hvcg.html";
  // } else {
  //   window.location.href = "/tracking-hvcg/test.html";
  // }
});

function filter() {
  window.filterOnNewTab = false;
  let pushArr = [];
  let mentorArr = [];
  let allTrackingUrl = [];
  let mentorArrDup = [];
  setStatusLoading();

  //lây url từng file tracktring
  $.getJSON(link_total_url_api, function (data) {
    //lặp mảng url
    //lặp từng mảng để lấy tên các mentor
    var arrData = data.values;
    for (var i = 1; i < arrData.length; i++) {
      mentorArr.push(arrData[i][1]);
    }
    mentorArrDup = mentorArr.filter(function (item, index) {
      return mentorArr.indexOf(item) === index;
    });

    arrData.map((val) => {
      if (val[3] === "Đang Học" && val[1] == filterBy[1]) {
        //các mảng sau khi được lọc với đk "đang học"
        //push các mảng đã lọc vào mảng mới
        pushArr.push(val);
      }
    });

    //lặp từng giá trị trong mảng mới và gen vào table
    for (var i = 0; i < pushArr.length; i++) {
      allTrackingUrl.push(pushArr[i][0]);
    }
  }).done(function () {
    removeTableRows();
    clearTimeouts();
    callAPIOnInterval(5, allTrackingUrl, pushArr);
  });
}

var timeouts = [];
var allTableRows = [];
let count = 0;
function callAPIOnInterval(
  initialChunk,
  allTrackingUrl,
  tableRows,
  startPoint = 0
) {
  let deferreds = [];

  for (
    let i = startPoint;
    i <= initialChunk && i < allTrackingUrl.length;
    i++
  ) {
    if (i == initialChunk) {
      timeouts.push(
        setTimeout(
          () =>
            callAPIOnInterval(
              initialChunk + 3,
              allTrackingUrl,
              tableRows,
              i + 1
            ),
          7000
        )
      );
    }
    if (startPoint === 0) {
      allTableRows = [];
    }
    let eachTrackingUrl = getApi(allTrackingUrl[i]);

    deferreds.push(
      $.getJSON(eachTrackingUrl, {}, function (data) {
        let dates = [];
        for (let i = 0; i < data.values.length; i++) {
          var timestamp = Date.parse(data.values[i][2]);

          if (isNaN(timestamp) == false) {
            dates.push(data.values[i][2]);
          }
        }
        tableRows[i]["i4"] = data.values[3][8];
        tableRows[i]["h4"] = data.values[3][7];
        tableRows[i]["e4"] = data.values[3][4];
        tableRows[i]["last_teaching_day"] = dates[dates.length - 1];
        // console.log(tableRows);
      })
        .done(() => {
          count++;
          $(".progress-bar-label").text(
            `${parseInt((count / tableRows.length) * 100)}%`
          );
          $(".progress-bar-label").css(
            "width",
            `${parseInt((count / tableRows.length) * 100)}%`
          );
          $("#percent").text(`${parseInt((count / tableRows.length) * 100)}%`);
        })
        .fail((e) => {
          $(".popup").show();
          // $(".popup p").html(`Có gì đó sai sai! <br/>
          // Status Code: ${e.responseJSON.error.code} <br/>
          // Error Message : ${e.responseJSON.error.message} <br/>
          // Link: <a href="${allTrackingUrl[i]}" target="_blank">Click here</a>
          // `);
          $(".popup").append(`<h3><span style="color:red;font-size:30px;">${e.responseJSON.error.code} </span></h3>`)
          $(".popup").append(`<p>${e.responseJSON.error.message}</p>`)
          $(".popup").append(`<a href="${allTrackingUrl[i]}" target="_blank">Check this link</a>`)
          $(".popup").append(`<p><em><b>Hiện tại ứng dụng hoạt động không chính xác!<b/></em></p>`)
        })
    );
  }
  $.when(...deferreds, startPoint).then(function () {
    renderTable(startPoint, tableRows);
    if (allTrackingUrl.length === allTrackingUrl.length) {
      // setStatusLoading();
      var indexDone = 0;
      sortTable(2);
      sortTable("theTimeLeft");
      // console.log(tableRows);
    }
  });
}
function renderKidClass(startPoint,tableRows) {
  var tongluong = 0;
  var statusOn = 0;
  for (let i = startPoint; i < tableRows.length; i++) {
    if (tableRows[i][3] == "Đang Học") {  
      if (tableRows[i][7] == "LTK" && localStorage.getItem("classType") == 1) {
        statusOn++;
        tableRows[i][4] = Number(tableRows[i][4]);
        hoursPaid = tableRows[i][4];
        var total_hour_learned = tableRows[i]["i4"];
        // if (typeof total_hour_learned != "undefined") {
        //   total_hour_learned = total_hour_learned.replace(",", ".");
        // }
  
        tableRows[i]["total_hour_learned"] = total_hour_learned;
        var totalSalaryPerClass =
          Math.round(total_hour_learned - hoursPaid) * tableRows[i][6];
        tableRows[i]["totalSalaryPerClass"] = totalSalaryPerClass;
        var theTimeLeft =
          Math.round((tableRows[i]["h4"] - total_hour_learned) * 1000) / 1000;
        tableRows[i]["theTimeLeft"] = theTimeLeft;
        var hoursToPay = Math.floor(
          ((total_hour_learned - hoursPaid) * 1000) / 1000
        );
        tableRows[i]["hoursToPay"] = hoursToPay;
        tongluong += totalSalaryPerClass;
  
        allTableRows = allTableRows.concat(
          tableRows.filter((item) => allTableRows.indexOf(item) < 0)
        );
  
        renderTableRow(tableRows[i], i);
        if (typeof total_hour_learned != "undefined") {
          document.getElementById("filter" + i).onclick = function () {
            var w = window.open(window.location.href, "_blank");
            w.filterOnNewTab = true;
            w.filterBy = tableRows[i];
            w.focus();
          };
          document.getElementById("filter" + i).onclick = function () {
            var w = window.open(window.location.href, "_blank");
            w.filterOnNewTab = true;
            w.filterBy = tableRows[i];
            w.focus();
          };
        }
      } else if (tableRows[i][7] == "HVCG" && localStorage.getItem("classType") == 2) {
        statusOn++;
        tableRows[i][4] = Number(tableRows[i][4]);
        hoursPaid = tableRows[i][4];
        var total_hour_learned = tableRows[i]["i4"];
        if (typeof total_hour_learned != "undefined") {
          total_hour_learned = total_hour_learned.replace(",", ".");
        }
  
        tableRows[i]["total_hour_learned"] = total_hour_learned;
        var totalSalaryPerClass =
          Math.round(total_hour_learned - hoursPaid) * tableRows[i][6];
        tableRows[i]["totalSalaryPerClass"] = totalSalaryPerClass;
        var theTimeLeft =
          Math.round((tableRows[i]["h4"] - total_hour_learned) * 1000) / 1000;
        tableRows[i]["theTimeLeft"] = theTimeLeft;
        var hoursToPay = Math.floor(
          ((total_hour_learned - hoursPaid) * 1000) / 1000
        );
        tableRows[i]["hoursToPay"] = hoursToPay;
        tongluong += totalSalaryPerClass;
  
        allTableRows = allTableRows.concat(
          tableRows.filter((item) => allTableRows.indexOf(item) < 0)
        );
  
        renderTableRow(tableRows[i], i);
        if (typeof total_hour_learned != "undefined") {
          document.getElementById("filter" + i).onclick = function () {
            var w = window.open(window.location.href, "_blank");
            w.filterOnNewTab = true;
            w.filterBy = tableRows[i];
            w.focus();
          };
          document.getElementById("filter" + i).onclick = function () {
            var w = window.open(window.location.href, "_blank");
            w.filterOnNewTab = true;
            w.filterBy = tableRows[i];
            w.focus();
          };
        }
      } else {
        statusOn++;
        tableRows[i][4] = Number(tableRows[i][4]);
        hoursPaid = tableRows[i][4];
        var total_hour_learned = tableRows[i]["i4"];
        if (typeof total_hour_learned != "undefined") {
          total_hour_learned = total_hour_learned.replace(",", ".");
        }
  
        tableRows[i]["total_hour_learned"] = total_hour_learned;
        var totalSalaryPerClass =
          Math.round(total_hour_learned - hoursPaid) * tableRows[i][6];
        tableRows[i]["totalSalaryPerClass"] = totalSalaryPerClass;
        var theTimeLeft =
          Math.round((tableRows[i]["h4"] - total_hour_learned) * 1000) / 1000;
        tableRows[i]["theTimeLeft"] = theTimeLeft;
        var hoursToPay = Math.floor(
          ((total_hour_learned - hoursPaid) * 1000) / 1000
        );
        tableRows[i]["hoursToPay"] = hoursToPay;
        tongluong += totalSalaryPerClass;
  
        allTableRows = allTableRows.concat(
          tableRows.filter((item) => allTableRows.indexOf(item) < 0)
        );
  
        renderTableRow(tableRows[i], i);
        if (typeof total_hour_learned != "undefined") {
          document.getElementById("filter" + i).onclick = function () {
            var w = window.open(window.location.href, "_blank");
            w.filterOnNewTab = true;
            w.filterBy = tableRows[i];
            w.focus();
          };
          document.getElementById("filter" + i).onclick = function () {
            var w = window.open(window.location.href, "_blank");
            w.filterOnNewTab = true;
            w.filterBy = tableRows[i];
            w.focus();
          };
        }
      }
    }
    }
    var totalSalary = document.getElementById("totalSalary");
    if (!isNaN(tongluong) && !window.filterOnNewTab) {
      totalSalary.innerHTML = "Tổng Lương : " + tongluong;
      setStatusDone(statusOn);
    } else {
      totalSalary.innerHTML = "";
    }
}
function renderHvcgClass(startPoint,tableRows) {
  var tongluong = 0;
  var statusOn = 0;
  for (let i = startPoint; i < tableRows.length; i++) {
    if (tableRows[i][3] == "Đang Học" && tableRows[i][7] == "HVCG") {  
        statusOn++;
        tableRows[i][4] = Number(tableRows[i][4]);
        hoursPaid = tableRows[i][4];
        var total_hour_learned = tableRows[i]["i4"];
        // if (typeof total_hour_learned != "undefined") {
        //   total_hour_learned = total_hour_learned.replace(",", ".");
        // }
  
        tableRows[i]["total_hour_learned"] = total_hour_learned;
        var totalSalaryPerClass =
          Math.round(total_hour_learned - hoursPaid) * tableRows[i][6];
        tableRows[i]["totalSalaryPerClass"] = totalSalaryPerClass;
        var theTimeLeft =
          Math.round((tableRows[i]["h4"] - total_hour_learned) * 1000) / 1000;
        tableRows[i]["theTimeLeft"] = theTimeLeft;
        var hoursToPay = Math.floor(
          ((total_hour_learned - hoursPaid) * 1000) / 1000
        );
        tableRows[i]["hoursToPay"] = hoursToPay;
        tongluong += totalSalaryPerClass;
  
        allTableRows = allTableRows.concat(
          tableRows.filter((item) => allTableRows.indexOf(item) < 0)
        );
  
        renderTableRow(tableRows[i], i);
        if (typeof total_hour_learned != "undefined") {
          document.getElementById("filter" + i).onclick = function () {
            var w = window.open(window.location.href, "_blank");
            w.filterOnNewTab = true;
            w.filterBy = tableRows[i];
            w.focus();
          };
          document.getElementById("filter" + i).onclick = function () {
            var w = window.open(window.location.href, "_blank");
            w.filterOnNewTab = true;
            w.filterBy = tableRows[i];
            w.focus();
          };
        }
      }
    }
    var totalSalary = document.getElementById("totalSalary");
    if (!isNaN(tongluong) && !window.filterOnNewTab) {
      totalSalary.innerHTML = "Tổng Lương : " + tongluong;
      setStatusDone(statusOn);
    } else {
      totalSalary.innerHTML = "";
    }
}
function renderAllClass(startPoint,tableRows) {
  var tongluong = 0;
  var statusOn = 0;
  if (localStorage.getItem("classType") == 0) {
    $('#classType option[value=0]').attr('selected','selected');
    for (let i = startPoint; i < tableRows.length; i++) {
      if (tableRows[i][3] == "Đang Học") {  
          statusOn++;
          tableRows[i][4] = Number(tableRows[i][4]);
          hoursPaid = tableRows[i][4];
          var total_hour_learned = tableRows[i]["i4"];
          // console.log(tableRows[i]);
          if (typeof total_hour_learned != "undefined") {
            total_hour_learned = total_hour_learned.replace(",", ".");
          }
            tableRows[i]["total_hour_learned"] = total_hour_learned
          var hoursToPay = Math.floor(
            ((total_hour_learned - hoursPaid) * 1000) / 1000
          );
          var totalSalaryPerClass =
          hoursToPay * tableRows[i][6];
          tableRows[i]["totalSalaryPerClass"] = totalSalaryPerClass;
          var theTimeLeft =
            Math.round((tableRows[i]["h4"] - total_hour_learned) * 1000) / 1000;
          tableRows[i]["theTimeLeft"] = theTimeLeft;
          
          tableRows[i]["hoursToPay"] = hoursToPay;
          tongluong += totalSalaryPerClass;
    
          allTableRows = allTableRows.concat(
            tableRows.filter((item) => allTableRows.indexOf(item) < 0)
          );
    
          renderTableRow(tableRows[i], i);
          if (typeof total_hour_learned != "undefined") {
            document.getElementById("filter" + i).onclick = function () {
              var w = window.open(window.location.href, "_blank");
              w.filterOnNewTab = true;
              w.filterBy = tableRows[i];
              w.focus();
            };
            document.getElementById("filter" + i).onclick = function () {
              var w = window.open(window.location.href, "_blank");
              w.filterOnNewTab = true;
              w.filterBy = tableRows[i];
              w.focus();
            };
          }
        }
      }
  } else if (localStorage.getItem("classType") == 1) {
    $('#classType option[value=1]').attr('selected','selected');
    for (let i = startPoint; i < tableRows.length; i++) {
      if (tableRows[i][3] == "Đang Học" && tableRows[i][7] == "LTK") {  
          statusOn++;
          tableRows[i][4] = Number(tableRows[i][4]);
          hoursPaid = tableRows[i][4];
          var total_hour_learned = tableRows[i]["i4"];
          if (typeof total_hour_learned != "undefined") {
            total_hour_learned = total_hour_learned.replace(",", ".");
          }
    
          tableRows[i]["total_hour_learned"] = total_hour_learned;
          var hoursToPay = Math.floor(
            ((total_hour_learned - hoursPaid) * 1000) / 1000
          );
          var totalSalaryPerClass =
          hoursToPay * tableRows[i][6];
          tableRows[i]["totalSalaryPerClass"] = totalSalaryPerClass;
          var theTimeLeft =
            Math.round((tableRows[i]["h4"] - total_hour_learned) * 1000) / 1000;
          tableRows[i]["theTimeLeft"] = theTimeLeft;
          
          tableRows[i]["hoursToPay"] = hoursToPay;
          tongluong += totalSalaryPerClass;
    
          allTableRows = allTableRows.concat(
            tableRows.filter((item) => allTableRows.indexOf(item) < 0)
          );
    
          renderTableRow(tableRows[i], i);
          if (typeof total_hour_learned != "undefined") {
            document.getElementById("filter" + i).onclick = function () {
              var w = window.open(window.location.href, "_blank");
              w.filterOnNewTab = true;
              w.filterBy = tableRows[i];
              w.focus();
            };
            document.getElementById("filter" + i).onclick = function () {
              var w = window.open(window.location.href, "_blank");
              w.filterOnNewTab = true;
              w.filterBy = tableRows[i];
              w.focus();
            };
          }
        }
      }
  } else if (localStorage.getItem("classType") == 2)  {
    $('#classType option[value=2]').attr('selected','selected');
    for (let i = startPoint; i < tableRows.length; i++) {
      if (tableRows[i][3] == "Đang Học" && tableRows[i][7] == "HVCG") {  
          statusOn++;
          tableRows[i][4] = Number(tableRows[i][4]);
          hoursPaid = tableRows[i][4];
          var total_hour_learned = tableRows[i]["i4"];
          if (typeof total_hour_learned != "undefined") {
            total_hour_learned = total_hour_learned.replace(",", ".");
          }
    
          tableRows[i]["total_hour_learned"] = total_hour_learned;
          var hoursToPay = Math.floor(
            ((total_hour_learned - hoursPaid) * 1000) / 1000
          );
          var totalSalaryPerClass =
          hoursToPay * tableRows[i][6];
          tableRows[i]["totalSalaryPerClass"] = totalSalaryPerClass;
          var theTimeLeft =
            Math.round((tableRows[i]["h4"] - total_hour_learned) * 1000) / 1000;
          tableRows[i]["theTimeLeft"] = theTimeLeft;
          tableRows[i]["hoursToPay"] = hoursToPay;
          tongluong += totalSalaryPerClass;
    
          allTableRows = allTableRows.concat(
            tableRows.filter((item) => allTableRows.indexOf(item) < 0)
          );
          renderTableRow(tableRows[i], i);
          if (typeof total_hour_learned != "undefined") {
            document.getElementById("filter" + i).onclick = function () {
              var w = window.open(window.location.href, "_blank");
              w.filterOnNewTab = true;
              w.filterBy = tableRows[i];
              w.focus();
            };
            document.getElementById("filter" + i).onclick = function () {
              var w = window.open(window.location.href, "_blank");
              w.filterOnNewTab = true;
              w.filterBy = tableRows[i];
              w.focus();
            };
          }
        }
      }
  }



    var totalSalary = document.getElementById("totalSalary");
    if (!isNaN(tongluong) && !window.filterOnNewTab) {
      totalSalary.innerHTML = "Tổng Lương : " + tongluong;
      setStatusDone(statusOn);
    } else {
      totalSalary.innerHTML = "";
    }
}
function renderTable(startPoint, tableRows) {
       renderAllClass(startPoint,tableRows)
        // statusOn++;
        // tableRows[i][4] = Number(tableRows[i][4]);
        // hoursPaid = tableRows[i][4];
        // var total_hour_learned = tableRows[i]["i4"];
        // if (typeof total_hour_learned != "undefined") {
        //   total_hour_learned = total_hour_learned.replace(",", ".");
        // }
  
        // tableRows[i]["total_hour_learned"] = total_hour_learned;
        // var totalSalaryPerClass =
        //   Math.round(total_hour_learned - hoursPaid) * tableRows[i][6];
        // tableRows[i]["totalSalaryPerClass"] = totalSalaryPerClass;
        // var theTimeLeft =
        //   Math.round((tableRows[i]["h4"] - total_hour_learned) * 1000) / 1000;
        // tableRows[i]["theTimeLeft"] = theTimeLeft;
        // var hoursToPay = Math.floor(
        //   ((total_hour_learned - hoursPaid) * 1000) / 1000
        // );
        // tableRows[i]["hoursToPay"] = hoursToPay;
        // tongluong += totalSalaryPerClass;
  
        // allTableRows = allTableRows.concat(
        //   tableRows.filter((item) => allTableRows.indexOf(item) < 0)
        // );
  
        // renderTableRow(tableRows[i], i);
        // if (typeof total_hour_learned != "undefined") {
        //   document.getElementById("filter" + i).onclick = function () {
        //     var w = window.open(window.location.href, "_blank");
        //     w.filterOnNewTab = true;
        //     w.filterBy = tableRows[i];
        //     w.focus();
        //   };
        //   document.getElementById("filter" + i).onclick = function () {
        //     var w = window.open(window.location.href, "_blank");
        //     w.filterOnNewTab = true;
        //     w.filterBy = tableRows[i];
        //     w.focus();
        //   };
        // }
 
}
function renderTableRow(row, index) {
  if (typeof row["e4"] != "undefined") {
    $("#table tbody").append(
      "<tr><td>" +
        `<span id="filter${index}">` +
        row["e4"] +
        "</span>" +
        "</td><td>" +
        `<a href="${row[0]}" target="_blank">` +
        row[2] +
        "</a>" +
        "</td><td>" +
        `<a id="linkFb-${index}" href="${row[5]}" target="_blank"><?xml version="1.0" encoding="UTF-8" standalone="no"?> <svg width="25" height="25" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z" fill="#3B5998"/>
<path d="M26.5015 38.1115V25.0542H30.1059L30.5836 20.5546H26.5015L26.5077 18.3025C26.5077 17.1289 26.6192 16.5001 28.3048 16.5001H30.5581V12H26.9532C22.6231 12 21.0991 14.1828 21.0991 17.8536V20.5551H18.4V25.0547H21.0991V38.1115H26.5015Z" fill="white"/>
</svg></a>` +
        "</td><td>" +
        row["total_hour_learned"] +
        "</td><td>" +
        row["h4"] +
        `</td><td id="timeleft-${index}">` +
        row["theTimeLeft"] +
        "</td><td>" +
        row[4] +
        "</td><td>" +
        row["hoursToPay"] +
        "</td><td>" +
        row["last_teaching_day"] +
        "</td><td>" +
        row[6] +
        "</td><td>" +
        row["totalSalaryPerClass"] +
        "</td></tr>"
    );
  }
  var timelefts = Number($(`#timeleft-${index}`).text());
  var linkFb = $(`#linkFb-${index}`);
  if (timelefts <= 3) {
    $(`#timeleft-${index}`).css({ color: "red", "font-weight": "bold" });
  }
  if (linkFb.attr("href") == "") {
    linkFb.hide();
  }
}

function sortTable(column = "i4") {
  // allTableRows.forEach((e,i) => {
  //   allTableRows[i]["i4"] = Number(allTableRows[i]["i4"])
  // });
  allTableRows.sort(function (a, b) {
    a = a[column];
    b = b[column];

    if (ascSortOrder) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    return a > b ? -1 : a < b ? 1 : 0;
  });

  removeTableRows();
  renderTable(0, allTableRows);
}

var ascSortOrder = true;
// $("#btn-sort-1").click(function () {
//   ascSortOrder = !ascSortOrder;
//   sortTable("i4");
// });

// $("#btn-sort-2").click(function () {
//   ascSortOrder = !ascSortOrder;
//   sortTable("h4");
// });

$("#btn-sort-3").click(function () {
  ascSortOrder = !ascSortOrder;
  sortTable("theTimeLeft");
});

$("#btn-sort-4").click(function () {
  ascSortOrder = !ascSortOrder;
  sortTable(4);
});

$("#btn-sort-5").click(function () {
  ascSortOrder = !ascSortOrder;
  sortTable("hoursToPay");
});
$("#btn-sort-by-student").click(function () {
  ascSortOrder = !ascSortOrder;
  sortTable(2);
});
$("#btn-sort-by-mentor").click(function () {
  ascSortOrder = !ascSortOrder;
  sortTable(1);
});
$("#btn-sort-last-day").click(function () {
  ascSortOrder = !ascSortOrder;
  sortTable("last_teaching_day");
});
$("#btn-sort-salary").click(function () {
  ascSortOrder = !ascSortOrder;
  sortTable(6);
});
$("#btn-sort-total-salary").click(function () {
  ascSortOrder = !ascSortOrder;
  sortTable("totalSalaryPerClass");
});

function clearTimeouts() {
  for (var i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }

  timeouts = [];
}

function removeTableRows() {
  $("#table tbody").empty();
}

function setStatusLoading() {
  $("#status").html(` 
      <div class="isLoading fs-18">Đang tải dữ liệu</div>
      <div id="loader-container">
        <div style="margin-top: 5px;"class="loader"></div>
        <div id="percent"></div>
      </div>
      `);
}

function setStatusDone(statusOn) {
  $("#status").html(`Truy vấn thành công ${statusOn} kết quả.`);
  $(".progress-bar-label").hide();
}

function handleAuthClick() {
  if (GoogleAuth.isSignedIn.get()) {
    // User is authorized and has clicked "Sign out" button.
    GoogleAuth.signOut();
  } else {
    // User is not signed in. Start Google auth flow.
    GoogleAuth.signIn();
  }
}
function revokeAccess() {
  GoogleAuth.disconnect();
}

function setSigninStatus() {
  var user = GoogleAuth.currentUser.get();
  var isAuthorized = user.hasGrantedScopes(SCOPE);
  if (isAuthorized) {
    $("#sign-in-or-out-button").html("Sign out");
    $("#revoke-access-button").css("display", "inline-block");
    $("#auth-status").html("Đăng nhập thành công");
  } else {
    $("#sign-in-or-out-button").html("Sign In/Authorize");
    $("#revoke-access-button").css("display", "none");
    $("#auth-status").html("Xin vui lòng đăng nhập");
  }
}

function updateSigninStatus() {
  setSigninStatus();
}
// ========================================== Kết thúc sign-in google ============================================
