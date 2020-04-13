/**
 * All api requests and handling
 */

/**
 * POST : check user login
 * 
 * @param {object} info
 */
function api_user_login(info) {
    var pass = false;
    var registration_code = store.get('registration_code');

    var params = new URLSearchParams();
    params.append('uname', info.username);
    params.append('pcode', info.password);
    params.append('registration_code', registration_code);

    var url_to_use = get_main_url();

    // record activity
    save_activity('login', 'login request was sent for user:' + info.username);

    axios.post(url_to_use + url_login, params)
        .then(function (response) {
            // store username
            store.set('username', info.username);

            if (response.data.success) {
                // time is the balance left of user
                var time = response.data.user.balance;

                if (time > 0) {
                    save_activity('login', 'user: ' + info.username + ' was successfully logged in');

                    store.set('main_url', url_to_use);
                    store.set('user_balance', time);
                    store.set('user_id', response.data.user.user_id);
                    store.set('cyber_id', response.data.user.cyber_id);
                    store.set('login_type', 'member');
                    store.set('ready_to_close', true);
                
                    var dimen = getWidowDimensions();

                    if (show_ad_page_first) {
                        // Open the ad Page before timer window, it shows time remaining and other
                        var win_info = {
                            'width' : dimen.width,
                            'height' : dimen.height,
                            'x' : 0,
                            'filepath' : 'ad.html',
                            'canClose' : false,
                            'showDev' : false,
                            'isFullscreen' : true,
                            'isAlwaysOnTop' : true,
                            'closeParent' : true,
                        };
                        open_window(win_info);
                    } else {
                        // Open timer window
                        var win_info = {
                            'width' : 240,
                            'height' : dimen.height,
                            'x' : dimen.width - 240,
                            'filepath' : 'timer.html',
                            'canClose' : false,
                            'showDev' : true,
                            'isFullscreen' : false,
                            'isAlwaysOnTop' : false,
                            'closeParent' : true,
                        };
                        open_window(win_info);
                    }
                    
                } else {
                    save_activity('login', 'user: ' + info.username + ' balance was low');

                    var msg = 'Your balance is low, please contact at the counter desk.';
                    $("#message").html(msg);
                    stop_request_login = false;
                }

                txt_pass.val('');
                btn_login.prop('disabled', false);
                btn_login.val('Login');
                
            } else {
                var msg = response.data.message;
                $("#message").html(msg);
                txt_pass.val('');
                stop_request_login = false;
                btn_login.prop('disabled', false);
                btn_login.val('Login');

                save_activity('login', 'user: ' + info.username + ' failed to login. Error: ' + msg);
            }
            
        })
        .catch(function (error) {
            console.log(error);

            var msg = 'username or password was wrong';
            $("#message").html(msg);
            btn_login.val('Login').prop('disabled', false);

            save_activity('login', 'user: ' + info.username + ' failed to login. Error: ' + msg);
        });
}

/**
 * Logout user and shutdown, all user related data is reset
 */
function api_logout(button) {
    log.info('logging out...');

    save_activity('logout', 'user: ' + user_id + ' has requested to log out.');

    if (button) {
        button.prop('disabled', true);
    }
    
    var params = new URLSearchParams();
    params.append('registration_code', registration_code);
    params.append('cyber_id', cyber_id);

    if (button) {
        if (user_id > 0) {
            params.append('op', 'user_logout');
            params.append('user_id', user_id);
            params.append('balance', balance_remain);
        } else {
            // normal logout
            params.append('op', 'normal_logout');
        }
    } else {
        params.append('op', 'computer_logout');
    }

    axios.post(url_logout, params)
        .then(function (response) {
            console.log(response.data);
            if (response.data.success) {
                // reset balance
                balance = 0;
                store.set('user_balance', balance);
               
                store.delete('login_type');
                store.delete('username');
                store.delete('user_balance');
                store.delete('user_id');
                store.delete('ready_to_close');

                save_activity('logout', 'user: ' + user_id + ' has successfully logged out.');

                shutdownComputer();
            } else {
                store.delete('username');
                store.delete('user_balance');
                store.delete('user_id');
                store.delete('ready_to_close');
                shutdownComputer();
                console.log('something went wrong');
            }
            
        })
        .catch(function (error) {
            console.log(error);
            console.log('something went wrong');
        });
}


/**
 * POST : install software to server
 *  Send mac address to server and get registration code, this registration code is used next time.
 * 
 * @param {string} macaddress 
 */
function api_install(macaddress) {
    if (stop_register_btn) {
        console.log('i have to stop you')
        return;
    }
    stop_register_btn = true;

    // show message
    $("#registration-message").html("Installation on progress...");

    var params = new URLSearchParams();
    params.append('xmac', macaddress);

    var url_to_use = get_main_url();
    
    axios.post(url_to_use + url_server_mac, params)
        .then(function (response) {

            stop_register_btn = false;
            
            if (response.data.success) {

                var code = response.data.machine.registration_id;
                
                $(".form-box").hide();
                $(".login-form").show();

                // save
                store.set('is_registered_x', 1);
                store.set('registration_code', code);

                // save registration
                // store.set('cyber_id', response.data.cyber_id);
                // store.set('is_registered_x', 1);
                // store.set('automatic_shutdown', response.data.automatic_shutdown);
                // store.set('opening_time', response.data.opening_time);
                // store.set('closing_time', response.data.closing_time);

            } else {
                $("#registration-message").html("Wrong Registration Code");
                $('#debugarea').html(JSON.stringify({'res': response.data, 'mac': macaddress }));
            }
            
            btn_install.prop('disabled', false);
        })
        .catch(function (error) {
            btn_install.prop('disabled', false);
            stop_register_btn = false;
        });
}

/**
 * POST : check user time left
 */
function api_refresh_user_time() {
    log.info('fetch balance update from server');

    var params = new URLSearchParams();
    params.append('registration_code', registration_code);
    params.append('cyber_id', cyber_id);
    params.append('user_id', user_id);

    axios.post(url_refresh_balance, params)
        .then(function (response) {
            console.log(response.data);
            
            if (response.data.success) {
                // reset balance
                balance = parseInt(response.data.current_balance);
                store.set('user_balance', balance);
                
                // update calculation variables
                reserved_time = balance*60;
            } else {
                // do nothing
            }

            is_refreshing = false;
            btn_refresh.html('Refresh').prop('disabled', false);
        })
        .catch(function (error) {
            console.log(error);
            console.log('something went wrong');
            is_refreshing = false;
            btn_refresh.html('Refresh').prop('disabled', false);
        });
}

/**
 * POST : check for turn off signal from server
 */
function api_check_status() {
    var registration_code = store.get('registration_code');

    var params = new URLSearchParams();
    params.append('code', registration_code);

    var url_to_use = get_main_url();
    
    axios.post(url_to_use + url_status, params)
        .then(function (response) {
            if (response.data.success) {
                // check to show or hide night mode
                var opening_time = parseInt(response.data.opening_time);
                var closing_time = parseInt(response.data.closing_time);
                
                var server_hour = parseInt(response.data.server_hour);
                // night time
                if (server_hour > closing_time || server_hour < opening_time) {
                    btn_nightmode.show();
                    console.log('ok')
                } else
                // morning time
                if (server_hour < opening_time) {
                    btn_nightmode.show();
                    console.log(server_hour + ' donek ' + opening_time)
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}