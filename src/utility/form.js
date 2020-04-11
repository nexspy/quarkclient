/**
 * Form validation and basic checking
 */

/**
 * Validate : check if username, password are present
 * 
 * info
 *   - username
 *   - password
 * 
 * @param {objet} info 
 */
function validate_user_info(info) {
    var valid = true;

    if (info.username.length == 0 || info.password.length == 0) {
        valid = false;
    }

    return valid;
}

/**
 * Validate : check if username,password is being used for reseting the software
 * @param {object} info 
 */
function validate_reset(info) {
    var valid = false;
    if (info.username == reset_username && info.password == reset_password) {
        valid = true;
    }
    return valid;
}

/**
 * Validate : check if user wants to close the softare
 * 
 * @param {object} info 
 */
function validate_immediate_close(info) {
    var valid = false;
    if (info.username == close_username && info.password == close_password) {
        valid = true;
    }
    return valid;
}

/**
 * Validate a string if it is url
 */
function validate_url(str) {
    return true;

    var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if(!regex .test(str)) {
      alert("Please enter valid URL.");
      return false;
    } else {
      return true;
    }
}

