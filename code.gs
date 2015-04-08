var currentUserEmail = Session.getActiveUser().getEmail(),
	appLink = "https://script.google.com/a/macros/bia.gov/s/AKfycbwcvcmIJp1j66whrQUr1raD8_7J67_aCyAQMogk8BOXGH1taZ4/exec";

function doGet() {
  var htmlPage = HtmlService.createTemplateFromFile('dashboard.html')
						    .evaluate()
						    .setSandboxMode(HtmlService.SandboxMode.NATIVE) //has to be native so file upload works
						    .setTitle('Tasking'),
  properties = getKeys(),
  appId = properties.appId,
  restApi = properties.restApi,
  url = 'https://api.parse.com/1/events/AppOpened';
  
  //track app opens
  var options = {
		    "method" : "post",
		    "headers" : {
		      "X-Parse-Application-Id": appId,
		      "X-Parse-REST-API-Key": restApi,
		      "Content-Type": "application/json"
		    },
             "muteHttpExceptions" : true,
             "contentType" : "application/json",
             "payload" : '{ "Data": { "at":{ "__type":"Date", "iso":"2013-05-02T12:00:00.000Z" } } }'
		  }
		  
  var data = UrlFetchApp.fetch(url, options);
  var json = data.getContentText();
  var cleanData = JSON.parse(json);
  
  return htmlPage;
}

function getContent(filename) {
	var html = HtmlService.createTemplateFromFile(filename).getRawContent();
	return html;
}

function getKeys() {
	  var properties = PropertiesService.getScriptProperties().getProperties(),
	  appId = properties.appId,
	  restApi = properties.restApi,
	  class = properties.class,
	  obj = { appId: appId, restApi: restApi, class: class };
	  	  
	  return obj;
}

function postTask(postObject) {
	var properties = getKeys(),
	appId = properties.appId,
	restApi = properties.restApi,
	class = properties.class,
	url = 'https://api.parse.com/1/classes/' + class,
	dueDate = Utilities.formatDate(new Date(postObject.DueDate), "America/New_York", "yyyy-MM-dd'T'HH:mm:ss'Z'"),
	date = new Date(postObject.DueDate).toISOString();
	
    var options = {
	    "method" : "post",
	    "headers" : {
	      "X-Parse-Application-Id": appId,
	      "X-Parse-REST-API-Key": restApi,
	      "Content-Type": "application/json"
	    },
	    "contentType" : "application/json",
	    "muteHttpExceptions" : true,
	    "payload" : '{ "Type": "TaskData", "Name": "' + postObject.Name + 
	    				'", "Requester": "' + postObject.Requester + 
	    				'", "DueDate": {"__type": "Date", "iso": "' + new Date(postObject.DueDate).toJSON() + 
	    				'"}, "Owner": "' + postObject.Owner +
	    				'", "Creator": "' + postObject.Creator +
	    				'", "Assignee": "' + postObject.Assignee +
	    				'", "Priority": ' + postObject.Priority +
                        ', "FileUrl": "' + postObject.FileUrl +
                        '", "FileName": "' + postObject.FileName +
	    				'"}'
	  }
	  
	  var data = UrlFetchApp.fetch(url, options);
      var json = data.getContentText();
	  var cleanData = JSON.parse(json);
	  
	  return [cleanData];
}

function getAllTasks() {
	  var properties = getKeys();
	  var appId = properties.appId;
	  var restApi = properties.restApi;
	  var class = properties.class;
	  var url = 'https://api.parse.com/1/classes/' + class;
	  
	  //options that are passed into the header along with the method
	  var options = {
	    "method" : "get",
	    "headers" : {
	      "X-Parse-Application-Id": appId,
	      "X-Parse-REST-API-Key": restApi,
	    }
	  }
	  
	  var data = UrlFetchApp.fetch(url, options);
	  var cleanData = JSON.parse(data).results;
	  
	  return cleanData;
}

function getSpecificTasks(query) {
	var allTasks = getAllTasks(),
	length = allTasks.length,
	i = 0,
	currentTask,
	currentTaskString,
	reqOffice,
	resultArray = [];
	
	for(i; i<length; i++) {
		currentTask = allTasks[i];
		currentTaskString = currentTask.Name + currentTask.ReqOffice;
		if(currentTaskString.toLowerCase()
							.indexOf(query.toLowerCase()) > -1) {
			resultArray.push(currentTask);
		}
	}
	
	if(resultArray.length === 0) {
		resultArray.push('No Results!')
	}
	
	return resultArray;
}

function updateATask(objectId,changeObj) {
	var properties = getKeys();
	var appId = properties.appId;
	var restApi = properties.restApi;
	var class = properties.class;
	// changeObj = {Name: 'another new name', ReqOffice: "another new office"};
	
	var url = 'https://api.parse.com/1/classes/' + class + '/' + objectId;
	  
	  //options that are passed into the header along with the method
	 var options = {
	    "method" : "put",
	    "headers" : {
	      "X-Parse-Application-Id": appId,
	      "X-Parse-REST-API-Key": restApi,
	      "Content-Type": "application/json"
	    },
	    "contentType" : "application/json",
	    "muteHttpExceptions" : true,
	    "payload" : '{ "Name": "' + changeObj.Name + '", "ReqOffice": "' + changeObj.ReqOffice + '"}'
	  }
	  
	  var data = UrlFetchApp.fetch(url, options);
	  var cleanData = JSON.parse(data).results;
	  
	  return cleanData;
}

function deleteATask(objectId) {
	var properties = getKeys();
	var appId = properties.appId;
	var restApi = properties.restApi;
	var class = properties.class;
	
	var url = 'https://api.parse.com/1/classes/' + class + '/' + objectId;
	  
	//options that are passed into the header along with the method
	  var options = {
	    "method" : "delete",
	    "headers" : {
	      "X-Parse-Application-Id": appId,
	      "X-Parse-REST-API-Key": restApi,
	    }
	  }
	  
	  var data = UrlFetchApp.fetch(url, options);
	  var cleanData = JSON.parse(data).results;
	  Logger.log(cleanData);
	  
	  return cleanData;
}