/**
 * All settings and global variables
 */
var api_version = '/api/v1';
var url_status = '/machine/status';
var url_register_code = '/machine/register';
var url_server_mac = '/machine/install';
var url_login = '/cyber/authenitcate';
var url_access = '/cyber/request';
// user login check for server login
var url_server_login = api_version + '/cyber/authenticate';
// fetch list of transactions for given cyber
var url_get_transactions = api_version + '/cyber/transactions/post';
// fetch list of computers status for given cyber
var url_get_computers = api_version + '/cyber/computers/post';
// stop computer
var url_stop_computer = api_version + '/cyber/computers/stop';
// search member
var url_search_member = api_version + '/cyber/member/search';

/**
 * Get the main url (domain) to use
 */
function get_main_url() {
    // static website
    return 'http://localhost/quark';
    return 'https://quark.cloud9gaminghub.com';
}