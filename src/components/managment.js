/**
 * 
 * All management software functions are here like rendering components
 * 
 */


/**
 * Render : a computer
 * @param {object} info 
 */
function render_computer(info) {
    var html = '';

    var timeleft = 0;
    if (info.status == "occupied") {
        timeleft = parseInt(info.actual_balance) - info.duration;
    }

    // uid: user id, cid: computer
    html += '<div class="computer computer-' + info.status + '" uid="' + info.id + '" cid="' + info.id + '" status="' + info.status + '">';
    if (info.status != "free") {
        if (timeleft <= 10) {
            img = "../assets/images/pc-member-low.png";
        } else {
            img = "../assets/images/pc-member.png";
        }
        
    } else {
        img = "../assets/images/pc-off.png";
    }
    html += '  <div class="computer-img"><img src="' + img + '" /></div>';

    // name of machine
    html += '<div>' + info.name + '</div>';

    if (info.status == "occupied") {
        html += '  <div>' + info.user_fullname + '</div>';
        html += '  <div>' + timeleft + ' mins left</div>';
    }
    
    html += '</div>';

    return html;
}

/**
 * Render : table
 * @param {object} data 
 */
function render_table(data) {
    var html = '';

    if (data.length <= 0) {
        return 'no transactions found.';
    }

    html += '<table class="list-table">';
    html += '<thead>';
    html += '  <tr>';
    html += '    <th>Type</th>';
    html += '    <th>Message</th>';
    html += '    <th>User</th>';
    html += '    <th>Time</th>';
    html += '  </tr>';
    html += '</thead>';

    if (data.length > 0) {
        html += '<tbody>';
        for(var i=0; i<data.length; i++) {
            html += render_transaction(data[i]);
        }
        html += '</tbody>';
    }

    html += '</table>';

    return html;
}

/**
 * Render : transaction as table row
 * @param {object} data 
 */
function render_transaction(data) {
    var html = '';

    html += '<tr role="row" class="odd">';
    html += '<td>';
    html += '<div class="activity-type type-' + data.type + '">';
    html += data.type;
    html += '</div>';
    html += '</td>';
    html += '<td>' + data.message + '</td>';
    html += '<td>' + data.username + '</td>';
    html += '<td db-id="0">' + data.time + '</td>';
    html += '</tr>'

    return html;
}

/**
 * Render : table for people
 * @param {object} data 
 */
function render_people_table(data) {
    var html = '';
    
    if (data.length <= 0) {
        return 'no people found.';
    }

    html += '<table class="list-table">';
    html += '<thead>';
    html += '  <tr>';
    html += '    <th>Username</th>';
    html += '    <th>Full name</th>';
    html += '    <th>Balance</th>';
    html += '    <th>Last login</th>';
    html += '  </tr>';
    html += '</thead>';

    if (data.length > 0) {
        html += '<tbody>';
        for(var i=0; i<data.length; i++) {
            html += render_people(data[i]);
        }
        html += '</tbody>';
    }

    html += '</table>';

    return html;
}

/**
 * Render : account as table row
 * @param {object} data 
 */
function render_people(data) {
    var html = '';

    html += '<tr role="row" class="odd">';
    html += '<td>';
    html += '<div>';
    html += data.username;
    html += '</div>';
    html += '</td>';
    html += '<td>' + data.fullname + '</td>';
    html += '<td>' + data.balance + '</td>';
    html += '<td db-id="0">' + data.lastlogin + '</td>';
    html += '</tr>'

    return html;
}

/**
 * Get : dummy data for computers
 */
function dummy_computers() {
    return [
        {
            'id': 1,
            'timeleft': 5, // in minutes
            'status' : 1, // 0 is off, 1 is ON
            'user' : 'Nirmal LImbu',
            'uid' : 1
        },
        {
            'id': 2,
            'timeleft': 20, // in minutes
            'status' : 1, // 0 is off, 1 is ON
            'user' : 'Summer Limbu',
            'uid' : 12
        },
        {
            'id': 3,
            'timeleft': 0, // in minutes
            'status' : 0, // 0 is off, 1 is ON
            'user' : '',
            'uid' : 0
        },
        {
            'id': 1,
            'timeleft': 5, // in minutes
            'status' : 1, // 0 is off, 1 is ON
            'user' : 'Nirmal LImbu',
            'uid' : 1
        },
        {
            'id': 2,
            'timeleft': 20, // in minutes
            'status' : 1, // 0 is off, 1 is ON
            'user' : 'Summer Limbu',
            'uid' : 12
        },
        {
            'id': 1,
            'timeleft': 5, // in minutes
            'status' : 1, // 0 is off, 1 is ON
            'user' : 'Nirmal LImbu',
            'uid' : 1
        },
        {
            'id': 2,
            'timeleft': 20, // in minutes
            'status' : 1, // 0 is off, 1 is ON
            'user' : 'Summer Limbu',
            'uid' : 12
        },
        {
            'id': 1,
            'timeleft': 5, // in minutes
            'status' : 1, // 0 is off, 1 is ON
            'user' : 'Nirmal LImbu',
            'uid' : 1
        },
        {
            'id': 2,
            'timeleft': 20, // in minutes
            'status' : 1, // 0 is off, 1 is ON
            'user' : 'Summer Limbu',
            'uid' : 12
        },
    ];
}

/**
 * Get : dummy data for transactions
 */
function dummy_transactions() {
    return [
        {
            'type': 'login',
            'message': 'Kamal Limbu has logged in computer 10',
            'user' : 'Nirmal LImbu',
            'time' : '10:30am'
        }
    ]
}

/**
 * Get : dummy data for people
 */
function dummy_people() {
    return [
        {
            'username': 'nirmallimbuu',
            'fullname': 'Nirmal Limbu',
            'balance' : 45,
            'lastlogin' : '10:30am 12 April 2020'
        }
    ]
}