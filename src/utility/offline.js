/**
 * Functions to store activity in background
 */

/**
 * Get : offline activities list
 */
function get_offline_data() {
    var data = store.get("app_activities", []);
    return data;
}

/**
 * Save : activity
 * @param {string} type 
 */
function save_activity(type, activity) {
    var activity = {
        'type' : type,
        'activity' : activity,
        'timestamp' : new Date()
    };

    // add activity to list
    var data = get_offline_data();
    data.push(activity);

    store.set("app_activities", data);
}