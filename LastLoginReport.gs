function generateUserUsageReport() {
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  var timezone = Session.getTimeZone();
  var date = "2016-04-27";
  Logger.log(date);

  var parameters = [
    'accounts:last_login_time',
    'accounts:last_sso_time',
    'gmail:last_imap_time',
    'gmail:last_pop_time',
    'gmail:last_webmail_time',
    'gmail:last_access_time'  
  ];
  var rows = [];
  var pageToken, page;
  do {
    page = AdminReports.UserUsageReport.get('all', '2016-04-27', {
      parameters: parameters.join(','),
      maxResults: 500,
      pageToken: pageToken
    });
    var reports = page.usageReports;
    if (reports) {
      for (var i = 0; i < reports.length; i++) {
        var report = reports[i];
        var parameterValues = getParameterValues(report.parameters);
        var row = [
          report.date,
          report.entity.userEmail,
          parameterValues['accounts:last_login_time'],
          parameterValues['accounts:last_sso_time'],
          parameterValues['gmail:last_imap_time'],
          parameterValues['gmail:last_pop_time'],
          parameterValues['gmail:last_webmail_time'],
          parameterValues['gmail:last_access_time'],
          
        ];
        rows.push(row);
      }
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  if (rows.length > 0) {
    var spreadsheet = SpreadsheetApp.create('Google Apps User Usage Report');
    var sheet = spreadsheet.getActiveSheet();

    // Append the headers.
    var headers = ['Date', 'User', 'Google Apps Login', 'SSO Login', 'Last IMAP', 'Last POP', 'Webmail Access', 'Last Gmail Access'];
    sheet.appendRow(headers);

    // Append the results.
    
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    Logger.log('Report spreadsheet created: %s', spreadsheet.getUrl());
  } else {
    Logger.log('No results returned.');
  }
}

/**
 * Gets a map of parameter names to values from an array of parameter objects.
 * @param {Array} parameters An array of parameter objects.
 * @return {Object} A map from parameter names to their values.
 */
function getParameterValues(parameters) {
  return parameters.reduce(function(result, parameter) {
    var name = parameter.name;
    var value;
    if (parameter.intValue !== undefined) {
      value = parameter.intValue;
    } else if (parameter.stringValue !== undefined) {
      value = parameter.stringValue;
    } else if (parameter.datetimeValue !== undefined) {
      value = new Date(parameter.datetimeValue);
    } else if (parameter.boolValue !== undefined) {
      value = parameter.boolValue;
    }
    result[name] = value;
    return result;
  }, {});
}
