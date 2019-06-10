/**
 * Bunch of deprecated functions
 */



/**
 * timer.js
 */
/**
 * Send Sync Request : check if machine has to be turned off
 * 
 * This request updates the 'last_sync' timestamp. Server constantly checks if last_sync is too old.
 * If last_sync is too old, and machine is still turned ON, then software was closed inproperly.
 */
function sync_server() {
    // if (stop_sync) {
    //     return;
    // }
    
    // console.log("server request----");

    // var params = new URLSearchParams();
    // params.append('registration_code', registration_code);
    // var action = 'sync';

    // // member time should be updated as it elapses
    // if (login_type == 'member') {
    //     // update the time
    //     action = 'update_member_time';
    // }

    // params.append('action', action);

    // // DEPRECATED : member balance should also be updated
    // // var balance = balance_remain;
    // // params.append('new_balance', balance);

    // // asks server to update the balance every minute
    // params.append('up_minute', 0);
    
    // axios.post(url_sync, params)
    //     .then(function (response) {
    //         var result = response.data;
    //         if (result.success) {
    //             // 
    //             if (result.reset) {
    //                 balance = parseInt(result.reset_balance);
    //                 reserved_time = balance*60; 
    //             }
    //         }
            
    //         // update timer according to fetched remaining time
    //         display_time(result);
            
    //         // show warning
    //         if (result.remaining <= 5*60 && !warning_shown) {
    //             show_warning();
    //         }

    //         // time to turn off
    //         if (result.remaining <= 0) {
    //             log.info('time has run out');
    //             request_logout(false);
    //         }
            
    //         // non-member should be automatically logged out
    //         if (0 && login_type == 'nonmember') {
    //             // computer turned-off has no transaction
    //             if (!result.machine.transaction) {
    //                 request_logout(false);
    //             }
    //         }
    //     })
    //     .catch(function (error) {
    //         console.log(error);
    //         console.log('something went wrong');
    //     });
}