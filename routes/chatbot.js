const API_LINK = "https://sik-api.tavg.net/v1/"; 
//const API_LINK = "http://192.168.56.104:52170/v1/";

//const CLIENT_LINK = "https://sik-test-client.tavg.net/";
const CLIENT_LINK = "http://tavg.local/sik-test-client/";

// client version
const CLIENT_VERSION = "1.2.1";
const CLIENT_VERSION_DATE = "2023-08-29";

// message types
const MSG_TYPE_USER = 1;
const MSG_TYPE_CHATGPT = 2;
const MSG_TYPE_CONSULTANT = 3

// chat message types
const CHAT_MSG_TYPE_NORMAL = 1;
const CHAT_MSG_TYPE_ERROR = 2;
const CHAT_MSG_TYPE_INFO = 3;

// client pages codes
const CLIENT_PAGE_CHATS_LIST = 1;
const CLIENT_PAGE_CHAT_DETAIL = 2;

// chat UUID
var chat_uid = "";

// timer for wait_reply function and calling period
var wait_reply_timer = null;
var wait_reply_period = 1000;
var wait_reply_period_long = 5000;

// last message time, used for '/chat/reply' endpoint
var last_msg_time = 0;

// flag that loader indicator has been added to the chat
var is_loading_indicator = 0;

// paginations variables
var page_num = 1;
var page_qty = 1;

// code of currenly open client's page
var client_curr_page = 0;

// get XMLHttpRequest
function getXmlHttp()
{
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}

// return string with date and time from unix timestamp (ms)
function format_time(timestamp_ms)
{
  // create JS Date object
  var date_obj = new Date(timestamp_ms);

  // extract date and time components
  var day = date_obj.getDate();
  var month = date_obj.getMonth() + 1;
  var year = date_obj.getFullYear();
  var hours = date_obj.getHours();
  var minutes = date_obj.getMinutes();
  var seconds = date_obj.getSeconds();
  
  // convert components to strings with lead zero
  var day_str = String(day);          if (day < 10) day_str = "0" + day_str;
  var month_str = String(month);      if (month < 10) month_str = "0" + month_str;
  var year_str = String(year);
  var hours_str = String(hours);      if (hours < 10) hours_str = "0" + hours_str;
  var minutes_str = String(minutes);  if (minutes < 10) minutes_str = "0" + minutes_str;
  var seconds_str = String(seconds);  if (seconds < 10) seconds_str = "0" + seconds_str;

  // create result string and return it
  return year_str + "/" + month_str + "/" + day_str + " " + hours_str + ":" + minutes_str + ":" + seconds_str;
}

// change page by user
function change_page(new_page_num)
{
  // set new page num to global var
  window.page_num = new_page_num;

  // load needed page
  if (window.client_curr_page == CLIENT_PAGE_CHATS_LIST) get_chats_list();
  if (window.client_curr_page == CLIENT_PAGE_CHAT_DETAIL) get_chat_messages();
}

// return string in "YYYY-MM-DDTHH:MM" format
function get_date_iso_string(date_obj)
{
  // extract date components
  var day = date_obj.getDate();
  var month = date_obj.getMonth() + 1;
  var year = date_obj.getFullYear();
  var hours = date_obj.getHours();
  var minutes = date_obj.getMinutes();

  // convert date components to strings with lead zero
  var day_str = String(day);          if (day < 10) day_str = "0" + day_str;
  var month_str = String(month);      if (month < 10) month_str = "0" + month_str;
  var year_str = String(year);
  var hours_str = String(hours);      if (hours < 10) hours_str = "0" + hours_str;
  var minutes_str = String(minutes);  if (minutes < 10) minutes_str = "0" + minutes_str;

  // result
  return year_str + "-" + month_str + "-" + day_str + "T" + hours_str + ":" + minutes_str;
}

// extract GET-param
function extract_get_param(param_name)
{
  var result = null;
  var tmp = [];
  var items = location.search.substr(1).split("&");

  for (var index = 0; index < items.length; index++)
  {
    tmp = items[index].split("=");
    if (tmp[0] === param_name)
    {
      result = decodeURIComponent(tmp[1]);
      return result;
    }
  }

  return result;
}

// init chat page
function init_chat_page()
{
  // set client page type
  window.client_curr_page = CLIENT_PAGE_CHAT_DETAIL;

  // extract chat UUID
  var chat_uuid = extract_get_param("uuid");

  // check that chat UUID is set
  if ( (chat_uuid == null) || (chat_uuid.length == 0) )
  {
    document.getElementById("error_msg").innerHTML = "Chat UUID not set."
    return;
  }

  // reset error message
  document.getElementById("error_msg").innerHTML = "";

  // set UUID to global var
  window.chat_uid = chat_uuid;

  // load chat info
  get_chat_info();
}

// init chats list page
function init_chats_list_page()
{
  // set client page type
  window.client_curr_page = CLIENT_PAGE_CHATS_LIST;

  // load chats list
  get_chats_list();
}

// search chat by UUID handler
function search_chat_by_uuid()
{
  // extract UUID
  var chat_uuid = document.getElementById("txt_search_chat_by_uuid").value;

  // if UUID empty - quit
  if (chat_uuid.length == 0) return;

  window.open("chat/?uuid=" + chat_uuid, "_self")
}

// set date/time filter for only today
function set_chats_filter_for_today()
{
  // date from (for chats filter)
  var date_from = new Date();
  date_from.setHours(0);
  date_from.setMinutes(0);
  date_from.setSeconds(0);
  date_from.setMilliseconds(0);
  chats_filter_from_val = get_date_iso_string(date_from);

  // date to (for chats filter)
  var date_to = date_from;
  date_to.setDate(date_from.getDate() + 1);
  chats_filter_to_val = get_date_iso_string(date_to);

  // set for the filter elements
  document.getElementById("chats_filter_from").value = chats_filter_from_val;
  document.getElementById("chats_filter_to").value = chats_filter_to_val;
}

// create navigation string for paginated data
function generate_nav_string(curr_page, pages_qty)
{
  var nav_string = '';

  if (pages_qty > 1)
  {
    if (pages_qty <= 10)
    {
      for (var i = 1; i <= pages_qty; i++)
      {
        if (nav_string.length > 0) nav_string = nav_string + ' ';
        if (curr_page == i)
        {
          nav_string = nav_string + '<strong>' + i + '</strong>';
        }
        else
        {
          nav_string = nav_string + '<a href="#" onclick="change_page(' + i + ')">' + i + '</a>';
        }
      }
    }
    else
    {
      if (curr_page < 5)
      {
        for (i = 1; i <= (curr_page + 1); i++)
        {
          if (nav_string.length > 0) nav_string = nav_string + ' ';
          if (curr_page == i)
          {
            nav_string = nav_string + '<strong>' + i + '</strong>';
          }
          else
          {
            nav_string = nav_string + '<a href="#p' + i + '" onclick="change_page(' + i + ')">' + i + '</a>';
          }
        }
        nav_string = nav_string + ' ... ';
        nav_string = nav_string + '<a href="#p' + (pages_qty - 1) + '" onclick="change_page(' + (pages_qty - 1) + ')">' + (pages_qty - 1) + '</a>' + ' ' + '<a href="#p' + pages_qty + '" onclick="change_page(' + pages_qty + ')">' + pages_qty + '</a>';
      }
        
      if ((curr_page >= 5) && (curr_page <= (pages_qty - 4)))
      {
        nav_string = '<a href="#p1" onclick="change_page(1)">1</a> <a href="#p2" onclick="change_page(2)">2</a> ... ' + '<a href="#p' + (curr_page - 1) + '" onclick="change_page(' + (curr_page - 1) + ')">' + (curr_page - 1) + '</a>' + ' ';
        nav_string = nav_string + '<strong>' + curr_page + '</strong> ';
        nav_string = nav_string + '<a href="#p' + (curr_page + 1) + '" onclick="change_page(' + (curr_page + 1) + ')">' + (curr_page + 1) + '</a>' + ' ... ';
        nav_string = nav_string + '<a href="#p' + (pages_qty - 1) + '" onclick="change_page(' + (pages_qty - 1) + ')">' + (pages_qty - 1) + '</a>' + ' ' + '<a href="#p' + pages_qty + '" onclick="change_page(' + pages_qty + ')">' + pages_qty + '</a>';
      }
        
      if (curr_page > (pages_qty - 4))
      {
        nav_string = '<a href="#p1" onclick="change_page(1)">1</a> <a href="#p2" onclick="change_page(2)">2</a> ... ';
        for (i = (curr_page - 1); i <= pages_qty; i++)
        {
          if (curr_page == i)
          {
            nav_string = nav_string + '<strong>' + i + '</strong>';
          }
          else
          {
            nav_string = nav_string + '<a href="#p' + i + '" onclick="change_page(' + i + ')">' + i + '</a>';
          }
          if (i != pages_qty) nav_string = nav_string + ' ';
        }
      }
    }
  }

  if (nav_string.length > 0)
  {
    if (curr_page > 1) nav_string = '<a href="#p' + (curr_page - 1) + '" onclick="change_page(' + (curr_page - 1) + ')">&lt;</a> ' + nav_string;
    if (curr_page < pages_qty) nav_string = nav_string + ' <a href="#p' + (curr_page + 1) + '" onclick="change_page(' + (curr_page + 1) + ')">&gt;</a> ';

    nav_string = nav_string + '<br><br>';
  }

  return nav_string;
}

// unblock input elements for allow sending new messages
function allow_send_messages()
{
  // unblock elements
  document.getElementById("btn_send_message").disabled = false;
  document.getElementById("message_text").disabled = false;

  // set focus to input text field
  document.getElementById("message_text").focus();
}

// remove loader indicator
function remove_loader_indicator()
{
  if (window.is_loading_indicator == 0) return;

  var chat_tbody = document.getElementById("tbl_chat").getElementsByTagName('tbody')[0];
  chat_tbody.deleteRow(-1);
  window.is_loading_indicator = 0;
}

// actions to do after close chat
function close_chat_post_actions()
{
  // remove loader indicator
  remove_loader_indicator();

  // add info message
  add_message_to_chat(null, "Chat has been closed.", CHAT_MSG_TYPE_INFO);

  // disable elements
  document.getElementById("message_text").disabled = true;
  document.getElementById("btn_send_message").disabled = true;

  // clear chat UUID
  window.chat_uid = "";

  // stop time for send requests to 'reply'
  clearTimeout(window.wait_reply_timer);
}

// send request to API
// calls callback_func with these params: "status" (HTTP response code) and "response" (response text)
function send_api_request(request_type, url, chat_uid, body_json, callback_func)
{
  var req = getXmlHttp();

  // handler for state change event
  req.onreadystatechange = function()
  {
    // if finished - call callback func
    if (req.readyState == 4) callback_func(req.status, req.responseText);
  }

  // open
  req.open(request_type, url, false);

  // add headers
  req.setRequestHeader("Content-Type", "application/json");
  if (chat_uid.length > 0) req.setRequestHeader("Chat-Uid", chat_uid);

  // send
  try 
  {
    req.send(JSON.stringify(body_json));
  } 
  catch (e) 
  {
    console.log(e);
    callback_func(0, "");
  }
}

// parsing and first checking responses from API
function parseJSONResponse(response)
{
  var res_array = null;
  
  try
  {
    // parse JSON
    res_array = JSON.parse(response);
  }
  catch (e)
  {
    return false;
  }

  return res_array;
}

// add message to the chat
function add_message_to_chat(msg_type, msg_text, msg_status)
{
  // put <br>
  msg_text = msg_text.replaceAll('\r\n', '<br>');
  msg_text = msg_text.replaceAll('\n', '<br>');
  msg_text = msg_text.replaceAll('\r', '<br>');

  // add new raw
  var chat_tbody = document.getElementById("tbl_chat").getElementsByTagName('tbody')[0];
  var msg_row = chat_tbody.insertRow();

  // add message cell
  var msg_cell = msg_row.insertCell();
  if (msg_status == CHAT_MSG_TYPE_NORMAL)
  {
    if (msg_type == MSG_TYPE_USER)
    {
      msg_cell.className = "user_msg";
      msg_cell.innerHTML = '<table class="chat_msg"><tr><td class="user_msg">' + msg_text + '</td><td class="filler">&nbsp;&nbsp;&nbsp;</td></tr></table>';
    }
    else
    {
      msg_cell.className = "cnst_msg";
      msg_cell.innerHTML = '<table class="chat_msg"><tr><td class="filler">&nbsp;&nbsp;&nbsp;</td><td class="cnst_msg">' + msg_text + '</td></tr></table>';
    }
  }
  if (msg_status == CHAT_MSG_TYPE_ERROR)
  {
    msg_cell.className = "error_msg";
    msg_cell.innerHTML = '<center><font color="#FF0000">' + msg_text + '</font></center>';
  }
  if (msg_status == CHAT_MSG_TYPE_INFO)
  {
    msg_cell.className = "info_msg";
    msg_cell.innerHTML = '<center><font color="#000080">' + msg_text + '</font></center>';
  }

  // scroll chat to the last message
  var div_chat_dom = document.getElementById("div_chat");
  div_chat_dom.scrollTop = div_chat_dom.scrollHeight;
}


/* OPEN CHAT FUNCTIONS */

function show_copy_result(result, dom_elem)
{
  // create result string
  var result_str = "";
  if (result) result_str = '<span class="success">copied</span>';
  else        result_str = '<span class="error">error</span>';

  // save old content of dom elem
  var old_content = document.getElementById(dom_elem).innerHTML;

  // update dom elem
  document.getElementById(dom_elem).innerHTML = result_str;

  // restore old content in dom elem after some seconds
  setTimeout(function()
  {
    document.getElementById(dom_elem).innerHTML = old_content;
  }, 1000);
}

function copy_to_clipboard(text_to_copy, dom_elem)
{
  console.log(text_to_copy);
  if (navigator.clipboard)
  {
    navigator.clipboard.writeText(text_to_copy).then(function ()
    {
      show_copy_result(true, dom_elem)
    },
    function ()
    {
      show_copy_result(false, dom_elem)
    });
  }
  else
  {
    show_copy_result(false, dom_elem)
  }
}

function open_chat_callback(result, response)
{
  resp_array = parseJSONResponse(response);
  if ((result == 200) && (resp_array !== false))
  {
    // save chat UUID to the global var
    window.chat_uid = resp_array['chat_uid'];

    // enable elements
    document.getElementById("message_text").disabled = false;
    document.getElementById("btn_send_message").disabled = false;

    // set focus on text field
    document.getElementById("message_text").focus();
  }
  else
  {
    // add error message
    add_message_to_chat(null, "ERROR", CHAT_MSG_TYPE_ERROR);
  }
}

function open_chat()
{
  // stop timer for sending requests to 'reply'
  clearTimeout(window.wait_reply_timer);

  // disable elements
  document.getElementById("message_text").disabled = true;
  document.getElementById("btn_send_message").disabled = true;

  // clear chat area
  var chat_tbody = document.getElementById("tbl_chat").getElementsByTagName('tbody')[0];
  chat_tbody.innerHTML = "";

  // show chat area
  document.getElementById("div_opening_chat").style.display = "none";
  document.getElementById("div_chat_main").style.display = "block";

  // send request to API
  send_api_request("POST", API_LINK + "chat/start", "", "{}", open_chat_callback);
}

function open_chat_with_confirmation()
{
  // if chat has been already closed - chat_uid is empty
  // so ask confirmation only if 'chat_uid' is not empty
  if (window.chat_uid.length > 0)
  {
    // ask user to confirm action
    var confirmation = confirm("New chat will be opened. Do you want to continue?");

    // if not confirmed - quit
    if (confirmation == false) return;
  }

  // call main function
  open_chat();
}


/* SEND MESSAGE FUNCTIONS */

function on_enter()
{
  if(event.key === 'Enter') send_message()
}

function send_message_callback(result, response)
{
  if (result == 200)
  {
    // every 'wait_reply_period' second send request for check response
    clearTimeout(window.wait_reply_timer);
    window.wait_reply_timer = setInterval(function() {
      wait_reply();
    }, wait_reply_period);
  }
  else
  {
    // parse JSON
    resp_array = parseJSONResponse(response);

    // remove loader indicator
    remove_loader_indicator();

    // add error message
    add_message_to_chat(null, "API ERROR: " + resp_array['error'], CHAT_MSG_TYPE_ERROR);

    // allow send new messages
    allow_send_messages();
  }
}

function send_message()
{
  // input text field DOM elem
  var input_text_field_dom = document.getElementById("message_text");

  // text of the message
  var msg_text = input_text_field_dom.value;

  // if message text is empty - return
  if (msg_text.length == 0) return;

  // create object with body content
  var body_json = {
    "msg": msg_text
  };

  // add message to the chat
  add_message_to_chat(MSG_TYPE_USER, msg_text, CHAT_MSG_TYPE_NORMAL);

  // update input fields
  input_text_field_dom.value = "";

  // add loader indicator to the chat
  var chat_tbody = document.getElementById("tbl_chat").getElementsByTagName('tbody')[0];
  var new_row = chat_tbody.insertRow();
  var new_cell = new_row.insertCell();
  new_cell.innerHTML = '<center><img src="images/loading.gif"></center>';
  window.is_loading_indicator = 1;

  // block input elements for prevent sending new message
  document.getElementById("btn_send_message").disabled = true;
  document.getElementById("message_text").disabled = true;

  // scroll chat to the last message
  var div_chat_dom = document.getElementById("div_chat");
  div_chat_dom.scrollTop = div_chat_dom.scrollHeight;

  // send to API
  send_api_request("POST", API_LINK + "chat/message", window.chat_uid, body_json, send_message_callback);
}


/* CLOSE CHAT FUNCTIONS */

function close_chat_callback(result, response)
{
  if (result == 200)
  {
    close_chat_post_actions();
  }
  else
  {
    // parse JSON
    resp_array = parseJSONResponse(response);

    // remove loader indicator
    remove_loader_indicator();

    // add error message
    add_message_to_chat(null, "API ERROR: " + resp_array['error'], CHAT_MSG_TYPE_ERROR);

    // allow send new messages
    allow_send_messages();
  }
}

function close_chat()
{
  // ask user to confirm action
  var confirmation = confirm("This chat will be closed, you will not be able to send new messages to this chat. Do you want to continue?");

  // if not confirmed - quit
  if (confirmation == false) return;

  // send to API
  send_api_request("POST", API_LINK + "chat/finish", window.chat_uid, {}, close_chat_callback);
}


/* CALL CONSULTANT FUNCTIONS */

function call_csnt_callback(result, response)
{
  if (result == 200)
  {
    add_message_to_chat(null, "Request for consultant to join this chat has been sent.", CHAT_MSG_TYPE_INFO);
  }
  else
  {
    // parse JSON
    resp_array = parseJSONResponse(response);

    // remove loader indicator
    remove_loader_indicator();

    // add error message
    add_message_to_chat(null, "API ERROR: " + resp_array['error'], CHAT_MSG_TYPE_ERROR);

    // allow send new messages
    allow_send_messages();
  }
}

function call_csnt()
{
  // send to API
  send_api_request("POST", API_LINK + "chat/callcsnt", window.chat_uid, {}, call_csnt_callback);
}


/* WAIT REPLY FUNCTIONS */

function wait_reply_callback(result, response)
{
  resp_array = parseJSONResponse(response);
  if (resp_array !== false)
  {
    if (result == 200)
    {
      // extract reply status
      var reply_status = resp_array['status'];

      // if reply status is "reply not ready" - nothing to do
      if (reply_status == 0) return;

      // change timer period
      clearTimeout(window.wait_reply_timer);
      window.wait_reply_timer = setInterval(function() {
        wait_reply();
      }, wait_reply_period_long);

      // remove loader indicator
      remove_loader_indicator();

      // if reply is ready - add reply test to the chat and update 'last_msg_time'
      if (resp_array['status'] == 1)
      {
        window.last_msg_time = resp_array['msg_time'];
        add_message_to_chat(MSG_TYPE_CHATGPT, resp_array['msg_text'], CHAT_MSG_TYPE_NORMAL);
      }

      // if ChatGPT error - add error info to the chat
      if (resp_array['status'] == 2)
      {
        add_message_to_chat(null, resp_array['err_info'], CHAT_MSG_TYPE_ERROR);
      }

      // ublock elements for allow send new messages
      allow_send_messages();
    }
    else
    {
      // remove loader indicator
      remove_loader_indicator();

      // add error message
      add_message_to_chat(null, "API ERROR: " + resp_array['error'], CHAT_MSG_TYPE_ERROR);

      // allow send new messages
      allow_send_messages();
    }
  }
}

function wait_reply()
{
  // create object with body content
  var body_json = {
    "after": window.last_msg_time
  };

  // send request
  send_api_request("POST", API_LINK + "chat/reply", window.chat_uid, body_json, wait_reply_callback);
}


/* GET CHATS LIST FUNCTIONS */

function get_chats_list_callback(result, response)
{
  // parse JSON response
  resp_array = parseJSONResponse(response);

  // array with chats list
  chats_array = resp_array.chats;

  // get DOM-elem with <tbody> of chats list table
  var tbl_chats_tbody = document.getElementById("tbl_chats_list").getElementsByTagName('tbody')[0];

  // clear chats list table
  while(tbl_chats_tbody.rows.length > 1)
  {
    tbl_chats_tbody.deleteRow(1);
  }

  // add rows with chats info
  for (var i = 0; i < chats_array.length; i++)
  {
    // status
    var chat_status_str = '<span class="info small_text">CLOSED</span>';
    if (chats_array[i].is_finished == 0) chat_status_str = '<span class="success">OPEN</span>';

    var chat_is_checked_str = '<span class="info small_text">YES</span>';
    if (chats_array[i].is_checked == 0) chat_is_checked_str = '<span class="error">NO</span>';

    var chat_is_wait_cstn_str = '<span class="info small_text">NO</span>';
    if (chats_array[i].is_cst_need == 1) chat_is_wait_cstn_str = '<span class="error">YES</span>';

    // new row
    var new_chat_row = tbl_chats_tbody.insertRow();

    // cells
    var cell_chat_start_time = new_chat_row.insertCell();
    var cell_chat_status = new_chat_row.insertCell();
    var cell_chat_messages_qty = new_chat_row.insertCell();
    var cell_chat_is_checked = new_chat_row.insertCell();
    var cell_chat_is_cstn_waiting = new_chat_row.insertCell();

    // fill cells
    cell_chat_start_time.innerHTML = '<a href="chat/index.html?uuid=' + chats_array[i].uuid + '">' + format_time(chats_array[i].start_time) + '</a><br><span class="small_text">' + format_time(chats_array[i].last_activity) + '</span>';
    cell_chat_status.innerHTML = chat_status_str;
    cell_chat_messages_qty.innerHTML = chats_array[i].total_msg_qty;
    cell_chat_is_checked.innerHTML = chat_is_checked_str;
    cell_chat_is_cstn_waiting.innerHTML = chat_is_wait_cstn_str;
  }

  // set page info to global vars
  window.page_qty = resp_array.pages_qty;
  window.page_num = resp_array.page_num;

  // update navigations strings
  document.getElementById("chats_list_nav_string1").innerHTML = generate_nav_string(window.page_num, window.page_qty);
  document.getElementById("chats_list_nav_string2").innerHTML = generate_nav_string(window.page_num, window.page_qty);
}

function get_chats_list()
{
  // get 'from' and 'to' values for filter
  var from_string = document.getElementById("chats_filter_from").value;
  var to_string = document.getElementById("chats_filter_to").value;

  // convert 'from' and 'to' strings to int
  var from_int_val = 0;
  var to_int_val = 0;
  if (from_string.length > 0) from_int_val = Math.floor(Date.parse(from_string) / 1000);
  if (to_string.length > 0) to_int_val = Math.floor(Date.parse(to_string) / 1000);

  // flags
  var filter_is_csnt_needed = document.getElementById("chats_filter_cst_needed").checked;
  var filter_is_not_checked = document.getElementById("chats_filter_not_checked").checked;

  // create URL GET-params string
  var uri_params = "?sorting=desc";
  if (window.page_num > 1) uri_params = uri_params + "&page=" + window.page_num;
  if (from_int_val > 0) uri_params = uri_params + "&time_from=" + from_int_val;
  if (to_int_val > 0) uri_params = uri_params + "&time_to=" + to_int_val;
  if (filter_is_csnt_needed) uri_params = uri_params + "&cst_needed=1";
  if (filter_is_not_checked) uri_params = uri_params + "&not_checked=1";

  // send request
  send_api_request("GET", API_LINK + "csnt/chats" + uri_params, "", {}, get_chats_list_callback);
}


/* GET CHAT INFOFMATION FUNCTIONS */

function get_chat_info_callback(result, response)
{
  // parse JSON response
  resp_array = parseJSONResponse(response);

  var chat_is_checked_str = '<span class="error">NOT CHECKED</span>';
  if (resp_array.is_checked == 1) chat_is_checked_str = '<span class="success">CHECKED</span>';

  var chat_is_finished_str = '<span class="error">OPEN</span>';
  if (resp_array.is_finished == 1) chat_is_finished_str = '<span class="success">CLOSED</span>';

  var chat_is_need_cstn_str = '';
  if (resp_array.is_cst_need == 1) chat_is_need_cstn_str = '<br><span class="error">WAITING CONSULTANT</span>';

  // show info at the page
  document.getElementById("chat_info_uuid").innerHTML = resp_array.uuid;
  document.getElementById("chat_info_start_ts").innerHTML = format_time(resp_array.start_time);
  document.getElementById("chat_info_last_act_ts").innerHTML = format_time(resp_array.last_activity);
  document.getElementById("chat_info_status").innerHTML = chat_is_checked_str + "<br>" + chat_is_finished_str + chat_is_need_cstn_str;
  document.getElementById("chat_info_msgs_qty").innerHTML = '<span class="info">' + resp_array.total_msg_qty + '</span><br><span class="small_text">' + resp_array.user_msg_qty + "/" + resp_array.csnt_msg_qty + "</span>";

  document.getElementById("chat_is_checked_no").checked = false;
  document.getElementById("chat_is_checked_yes").checked = false;
  if (resp_array.is_checked == 1) document.getElementById("chat_is_checked_yes").checked = true;
  else document.getElementById("chat_is_checked_no").checked = true;

  // load messages
  get_chat_messages();
}

function get_chat_info()
{
  // send request
  send_api_request("GET", API_LINK + "csnt/chat", window.chat_uid, {}, get_chat_info_callback);
}


/* GET CHAT MESSAGES FUNCTIONS */

function get_chat_messages_callback(result, response)
{
  // parse JSON response
  resp_array = parseJSONResponse(response);

  // array with chat messages
  chat_messages_array = resp_array.messages;

  // get DOM-elem with <tbody> of chats list table
  var tbl_chat_messages_tbody = document.getElementById("tbl_chat_messages");

  // clear chat messages table
  while(tbl_chat_messages_tbody.rows.length > 0)
  {
    tbl_chat_messages_tbody.deleteRow(0);
  }

  // if no message - show notice
  if (chat_messages_array.length == 0)
  {
    // add row and cell
    var msg_row = tbl_chat_messages_tbody.insertRow();
    var msg_cell = msg_row.insertCell();
    msg_cell.innerHTML = "<center>There are no messages in this chat.</center>";
  }

  // add rows with chats info
  for (var i = 0; i < chat_messages_array.length; i++)
  {
    // message object
    var msg_obj = chat_messages_array[i];

    // message type
    msg_type_str = "";
    if (msg_obj.type == 1) msg_type_str = "User";
    if (msg_obj.type == 2) msg_type_str = "ChatGPT";
    if (msg_obj.type == 3) msg_type_str = "Consultant";

    // add row and cell
    var msg_row = tbl_chat_messages_tbody.insertRow();
    var msg_cell = msg_row.insertCell();

    // fill message cell
    msg_cell.innerHTML = '<span class="msg_title">' + format_time(msg_obj.time) + " | " + msg_type_str + "</span><br>" + msg_obj.text;
  }

  // set page info to global vars
  window.page_qty = resp_array.pages_qty;
  window.page_num = resp_array.page_num;

  // update navigations strings
  document.getElementById("chat_messages_nav_string1").innerHTML = generate_nav_string(window.page_num, window.page_qty);
  document.getElementById("chat_messages_nav_string2").innerHTML = generate_nav_string(window.page_num, window.page_qty);
}

function get_chat_messages()
{
  // create URL GET-params string
  var uri_params = "";
  if (window.page_num > 1) uri_params = uri_params + "?page=" + window.page_num;

  // send request
  send_api_request("GET", API_LINK + "csnt/messages" + uri_params, window.chat_uid, {}, get_chat_messages_callback);
}


/* ADD CONSULTANT'S MESSAGE FUNCTIONS */

function add_cstn_reply_callback(result, response)
{
  resp_array = parseJSONResponse(response);
  if ((result == 200) && (resp_array !== false))
  {
    // clear input area
    document.getElementById("txt_cstn_reply").value = "";

    // update displayed info
    init_chat_page();
  }
  else
  {
    // show error message
    document.getElementById("span_add_cstn_reply_err_msg").innerHTML = "ERROR " + result + "/" + resp_array.error  + "<br><br>";
  }
}

function add_cstn_reply()
{
  // clear error message
  document.getElementById("span_add_cstn_reply_err_msg").innerHTML = "";

  // get message text
  var msg_text = document.getElementById("txt_cstn_reply").value;
  
  // if message text is empty - quit
  if (msg_text.length == 0) return;
  
  // create object with body content
  var body_json = {
    "msg": msg_text
  };
  
  // send request
  send_api_request("POST", API_LINK + "csnt/reply", window.chat_uid, body_json, add_cstn_reply_callback);
}


/* SET CHAT VERIFY STATUS FUNCTIONS */

function set_chat_verify_status_callback(result, response)
{
  resp_array = parseJSONResponse(response);
  if ((result == 200) && (resp_array !== false))
  {
    // update displayed info
    init_chat_page();
  }
  else
  {
    // show error message
    document.getElementById("span_set_verify_status_err_msg").innerHTML = "ERROR " + result + "/" + resp_array.error  + "<br><br>";
  }
}

function set_chat_verify_status()
{
  // clear error message
  document.getElementById("span_set_verify_status_err_msg").innerHTML = "";

  // determine selected verify status
  var chat_is_checked = 0;
  if (document.getElementById("chat_is_checked_yes").checked) chat_is_checked = 1;

  // create object with body content
  var body_json = {
    "status": chat_is_checked
  };
  
  // send request
  send_api_request("POST", API_LINK + "csnt/verify", window.chat_uid, body_json, set_chat_verify_status_callback);
}


/* CLOSE CHAT BY CONSULTANT FUNCTIONS */

function close_chat_by_cstn_callback(result, response)
{
  resp_array = parseJSONResponse(response);
  if ((result == 200) && (resp_array !== false))
  {
    // update displayed info
    init_chat_page();
  }
  else
  {
    // show error message
    document.getElementById("span_set_verify_status_err_msg").innerHTML = "ERROR " + result + "/" + resp_array.error  + "<br><br>";
  }
}

function close_chat_by_cstn()
{
  // clear error message
  document.getElementById("span_set_verify_status_err_msg").innerHTML = "";

  // determine selected verify status
  var chat_is_checked = 0;
  if (document.getElementById("chat_is_checked_yes").checked) chat_is_checked = 1;

  // create object with body content
  var body_json = {};
  if (chat_is_checked == 1)
  {
    body_json = {
      "verified": chat_is_checked
    };
  }
  
  // send request
  send_api_request("POST", API_LINK + "csnt/close", window.chat_uid, body_json, close_chat_by_cstn_callback);
}