console.log('Client-side code running');

var permissionAvailable;
var initialXMl;
var itemSelected;

/**
 * Onload, retrieves the last-used (if any exists) file path to the profiles folder.
 * And checks if the connection is still active to avoid showing the login form at every refresh
 * Sets the status and the environment below the page title.
 */
window.onload = (event) => {
  document.getElementById('inputPath').value = localStorage.getItem('file-path');
  fetch('/checkConnection', {method: 'GET'})
      .then(response => response.text())
      .then(data => {
        if(data != ''){
          document.getElementById('login-form').style.display = 'none';
          setEnvLabel(data);
          toggleButtonsBasedOnLogin(true);
        }else{
          toggleButtonsBasedOnLogin(false);
        }
      });
};

/*
 * Enables action buttons based on the user status (logged-in or not)
 * Since all the current actions actually need a connection with Salesforce to be performed
 */
function toggleButtonsBasedOnLogin(enable){
  var elems = document.getElementsByClassName('needs-login');
  for(var i = 0; i < elems.length; i++) {
      elems[i].disabled = !enable;
  }
}
 
fetch('/getPermission', {method: 'GET'})
.then(response => response.json())
  .then(data => {
    console.log(data);
    permissionAvailable = data;
    data.forEach(function(item, index, array) {
      console.log(item, index);

      var option = document.createElement("option");
      option.text = item.value;
      option.value = item.key;
      var select = document.getElementById("permissionList");
      select.appendChild(option);
    })
  });

const button = document.getElementById('myButton');

button.addEventListener('click', function(e) {
  console.log('button was clicked');

  var inputPathJs = document.getElementById('inputPath').value;

  if(inputPathJs==null || inputPathJs == undefined || inputPathJs=='')
  {
    document.getElementById('error-path').innerHTML = "Inserire un path valido";
    return;
  }

  fetch('/profileList', {method: 'POST',headers: {'Content-Type': 'application/json'},body:JSON.stringify({ path: inputPathJs})})
      .then(response => response.json())
      .then(data => {
        document.getElementById("profileList").size = '20';
        document.getElementById("display").style = 'height: 353px;width: 100%;margin: 0px;';
        button.innerHTML = '<i id="select-folder-icon" class="fa fa-refresh" aria-hidden="true"></i> Aggiorna';
        button.classList.remove('btn-primary');
        button.classList.add('btn-light');
        if(data == "Errore nel path"){
          printMessage('error', data);
          return;
        }
        //at this point path is valid. Save for future use
        localStorage.setItem('file-path',inputPathJs );
        const selectAllButton = document.getElementById('selectAll');
        selectAllButton.style.display = 'block';
        
        data.forEach(function(item, index, array) {
          console.log(item, index);

          var option = document.createElement("option");
          option.text = item;
          option.value = item;
          var select = document.getElementById("profileList");
          select.appendChild(option);
          
        })
      })
      .catch(function(error) {
        console.log(error);
      })
});



const selectItem = document.getElementById('permissionList');

/*selectItem.addEventListener('change',function(e){


  var index = e.target.selectedIndex;

  var item = new Object();
  item.text = e.target[index].text;
  item.value = e.target.value;
  itemSelected= item;

  fetch('/getConfiguration?fileName='+e.target.value, {method: 'GET'})

  .then(response => response.text())
    .then(data => {
      document.getElementById('textXML').value = data;
      initialXMl = data;

      permissionAvailable.forEach(function(item, index, array) {

        if(document.getElementById(item.key)!=null)
          document.getElementById(item.key).style.pointerEvents = "none";

      });
      console.log('Pointer event : '+e.target.value);
      if(document.getElementById(e.target.value)!=null)
        document.getElementById(e.target.value).style.pointerEvents = "all";
      if(e.target.value == 'fieldPermissions')
        document.getElementById('objectPermissions').style.pointerEvents = "all";
      
    });
});*/

selectItem.addEventListener('change', (event)=> getXMLfragment(event.target) );

function getXMLfragment(target){

  //alert(e.target.value);
  if(!target.value.includes('NONE')){
    let profilesInvolved = getSelectedProfilesNumber();
    let singularOrPlural = profilesInvolved > 1? ' profili' : ' profilo';
    let message = profilesInvolved == 0 ? '. Seleziona i profili da modificare.' : ' su '+ profilesInvolved + singularOrPlural;
    printMessage('warning', 'stai per modificare: ' + target.value + message);
  }

  //var index = target.selectedIndex;

  var item = new Object();
  item.text = target.text;
  item.value = target.value;
  itemSelected= item;

  fetch('/getConfiguration?fileName='+target.value, {method: 'GET'})

  .then(response => response.text())
    .then(data => {
      document.getElementById('textXML').value = data;
      initialXMl = data;

      permissionAvailable.forEach(function(item, index, array) {

        if(document.getElementById(item.key)!=null)
          document.getElementById(item.key).style.pointerEvents = "none";

      });
      console.log('Pointer event : '+target.value);
      if(document.getElementById(target.value)!=null)
        document.getElementById(target.value).style.pointerEvents = "all";
      if(target.value == 'fieldPermissions')
        document.getElementById('objectPermissions').style.pointerEvents = "all";
      
    });
}

const aggiungi = document.getElementById('addVisibility');
var opts = [], opt;

aggiungi.addEventListener('click', function(e){

  $("div.spanner").addClass("show");
  let valueToAdd = document.getElementById('textXML').value;
  console.log('VALUE TO ADD ' + valueToAdd.includes);

  let permissionItem = document.getElementById('permissionList').value;
  console.log(permissionItem);

  let profileToAddIt = document.getElementById('display').value;
  console.log(profileToAddIt);

  if(valueToAdd==null || valueToAdd == undefined || valueToAdd=='')
  {
    document.getElementById('error-xml').innerHTML = "Xml non valido";
    $("div.spanner").removeClass("show");
    return;
  }else if( valueToAdd.includes('[') ||  valueToAdd.includes(']')){
    $("div.spanner").removeClass("show");
    printMessage('error','Ci sono dei tag non sostituiti correttamente "[ e/o ]" ');
    return;
  }
  if(profileToAddIt==null || profileToAddIt == undefined || profileToAddIt == '')
  {
    document.getElementById('error-profile').innerHTML = "Nessun profilo selezionato!";
    $("div.spanner").removeClass("show");
    return;
  }

  let itemList = profileToAddIt.split(', ');
  let result = 'OK. fatto!';
  itemList.forEach(function(item, index, array) {

    fetch('/addItemsInProfile', {method: 'POST',headers: {'Content-Type': 'application/json'},body:JSON.stringify({profile: item,permission:permissionItem,permissionValue:valueToAdd})})
      .then(response => response.text())
      .then(data => {
        console.log(data);
        result = data;
        })
  });
  console.log('done');
  $("div.spanner").removeClass("show");
  printMessage('success',result);
});

const rimuovi = document.getElementById('removeVisibility');

rimuovi.addEventListener('click', function(e){

  $("div.spanner").addClass("show");
  let valueToAdd = document.getElementById('textXML').value;
  console.log(valueToAdd);

  let permissionItem = document.getElementById('permissionList').value;
  console.log(permissionItem);

  let profileToAddIt = document.getElementById('display').value;
  console.log(profileToAddIt);

  if(valueToAdd==null || valueToAdd == undefined || valueToAdd=='')
  {
    document.getElementById('error-xml').innerHTML = "Xml non valido";
    $("div.spanner").removeClass("show");
    return;
  }else if( valueToAdd.includes('[') ||  valueToAdd.includes(']')){
    $("div.spanner").removeClass("show");
    printMessage('error','Ci sono tag non sostituiti correttamente "[ e/o ]" ');
    return;
  }
  if(profileToAddIt==null || profileToAddIt == undefined || profileToAddIt == '')
  {
    document.getElementById('error-profile').innerHTML = "Nessun profilo selezionato!";
    $("div.spanner").removeClass("show");
    return;
  }

  let itemList = profileToAddIt.split(', ');
  let result = 'OK. fatto!';
  itemList.forEach(function(item, index, array) {

    fetch('/addItemsInProfile', {method: 'POST',headers: {'Content-Type': 'application/json'},body:JSON.stringify({profile: item,permission:permissionItem,permissionValue:valueToAdd,action:'remove'})})
      .then(response => response.text())
      .then(data => {
        console.log(data);
        result = data;
        })
  });
  console.log('done');
  $("div.spanner").removeClass("show");
  printMessage('success', result);
});

document.getElementById('profileList').onchange = function(e) {
  // get reference to display textarea
  var display = document.getElementById('display');
  display.innerHTML = ''; // reset
  
  // callback fn handles selected options
  getSelectedOptions(this, callback);
  toggleSelectAllButton();
  // remove ', ' at end of string
  var str = display.innerHTML.slice(0, -2);
  display.innerHTML = str;
};

// example callback function (selected options passed one by one)
function callback(opt) {
  // display in textarea for this example
  var display = document.getElementById('display');
  display.innerHTML += opt.value + ', ';

  // can access properties of opt, such as...
  //alert( opt.value )
  //alert( opt.text )
  //alert( opt.form )
}
// arguments: reference to select list, callback function (optional)
function getSelectedOptions(sel, fn) {
  
  
  // loop through options in select list
  for (var i=0, len=sel.options.length; i<len; i++) {
      opt = sel.options[i];
      
      // check if selected
      if ( opt.selected ) {
          // add to array of option elements to return from this function
          opts.push(opt);
          
          // invoke optional callback function if provided
          if (fn) {
              fn(opt);
          }
      }
  }
}

const selectAllButton = document.getElementById('selectAll');

selectAllButton.addEventListener('click', function(e) {
  
  var profiles = document.getElementById("profileList");
  
    var i;
    for (i = 0; i < profiles.length; i++) {
      if(!profiles.options[i].selected){
        profiles.options[i].selected = true;
      }
    }
    toggleSelectAllButton();
    getSelectedOptions(profiles, callback);
});

function toggleSelectAllButton(){
  console.log('TOTAL ' + document.getElementById("profileList").length + ' SELECTED ' +getSelectedProfilesNumber() );
  console.log(document.getElementById("profileList").length > getSelectedProfilesNumber());
  document.getElementById('selectAll').disabled = !(document.getElementById("profileList").length > getSelectedProfilesNumber());
}

function getSelectedProfilesNumber(){
  let profiles = document.getElementById("profileList");
  let quantity = 0;
    let i;
    for (i = 0; i < profiles.length; i++) {
      if(profiles.options[i].selected){
          quantity++;
      }
    }
    return quantity;
}

const enviromentPicklist = document.getElementById('enviromentPicklist');
enviromentPicklist.addEventListener('change',function(e){
  if(enviromentPicklist.value == 'https://login.salesforce.com'){
    printMessage('warning', "Hai selezionato 'Produzione'. Le modifiche dirette in produzione sono sconsigliate.");
  }
});

const loginButton = document.getElementById('loginBtton');

loginButton.addEventListener('click',function(e){

  var usernameJs = document.getElementById('username').value;
  var passwordJs = document.getElementById('password').value;
  var enviromentValue = document.getElementById('enviromentPicklist').value;

  $("div.spanner").addClass("show");
  console.log('login button');
  fetch('/loginSFDC', {method: 'POST',headers: {'Content-Type': 'application/json'},body:JSON.stringify({ username: usernameJs,password:passwordJs,enviroment:enviromentValue})})
      .then(response => response.text())
      .then(data => {

        if(data.includes('error')){
          printMessage('error', data);
        }else{
          printMessage('success', 'Sei loggato in '+ data);
          document.getElementById('login-form').style.display = 'none';
          setEnvLabel(data);
          toggleButtonsBasedOnLogin(true);
        }
        
        $("div.spanner").removeClass("show");
      })
      .catch(function(error) {
        console.log(error);
        $("div.spanner").removeClass("show");
      })


});

function setEnvLabel(data){
  let enviromentTag = document.getElementById('env-tag');
  enviromentTag.classList.remove('badge-secondary');
  enviromentTag.classList.add('badge-success');
  enviromentTag.innerText = data;
  document.getElementById('logout-icon').style.display = 'inline';
}

document.getElementById('logout-icon').addEventListener('click',function(e){
console.log('LOOOOOOGOUT');



fetch('/logoutSFDC', {method: 'GET'})
      .then(response => response.text())
      .then(data => {
        console.log('LOGOUT DATA ' + data);
      //  location.reload();
      })
      .catch(function(error) {
        console.log(error);
      })
});

function printMessage(type, msg){
  console.log('print msg called');
  let classToAdd = '';
  let icon = '<i class="fa fa-exclamation-triangle mr-2"></i>'
  switch(type) {
    case 'error':
      classToAdd = 'alert-danger';
      break;
    case 'warning':
      classToAdd = 'alert-warning';
      break;
    default:
      classToAdd = 'alert-success';
      icon = '<i class="fa fa-check-circle mr-2"></i>'
  }

  document.getElementById('alert-area').innerHTML = '<div id ="alertMsg" class="alert alert-dismissible fade show" role="alert" ><div id="alert-text"></div><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
  document.getElementById('alert-text').innerHTML = icon + msg;
  document.getElementById('alertMsg').classList.add(classToAdd);
  autoCloseAlert();
  
}

function autoCloseAlert(){
  setTimeout(function() {
    $(".alert-dismissible").alert('close');
}, 2500);
}

const getAllObject = document.getElementById('getAllObj');

getAllObject.addEventListener('click',function(e){
 
  $("div.spanner").addClass("show");
  console.log('login button');
  fetch('/retrieveAllSObject', {method: 'GET'})
      .then(response => response.json())
      .then(data => {

        data.forEach(function(item, index, array) {
          console.log(item, index);
    
          var option = document.createElement("option");
          option.text = item.name;
          option.value = item.name;
          var select = document.getElementById("objectPermissions_select");
          select.appendChild(option);
        });
        
        $("div.spanner").removeClass("show");
      })
      .catch(function(error) {
        console.log(error);
        $("div.spanner").removeClass("show");
      })
      
});

const getFields = document.getElementById('getAllField');

getFields.addEventListener('click',function(e){

  $("div.spanner").addClass("show");
  var objNameValue =  document.getElementById('objectPermissions_select').value;
  console.log(objNameValue);
  fetch('/retrieveAllField/'+objNameValue, {method: 'GET'})
      .then(response => response.json())
      .then(data => {

        data.forEach(function(item, index, array) {

          var option = document.createElement("option");
          option.text =  item.NamespacePrefix!=null? item.NamespacePrefix+'__'+item.name : item.name;
          option.value = item.NamespacePrefix!=null? item.NamespacePrefix+'__'+item.name : item.name
          var select = document.getElementById("fieldPermissions_select");
          select.appendChild(option);
          
        });
        
        $("div.spanner").removeClass("show");
      })
      .catch(function(error) {
        console.log(error);
        $("div.spanner").removeClass("show");
      })


});

const getClass = document.getElementById('getAllclass');

getClass.addEventListener('click', ()=> getClasses());

function getClasses(){

  $("div.spanner").addClass("show");
  
  console.log('login button');
  fetch('/retrieveAllClasses', {method: 'GET'})
      .then(response => response.json())
      .then(data => {

        data.forEach(function(item, index, array) {
          console.log(item, index);
          
          
          var option = document.createElement("option");
          option.text = item.NamespacePrefix!=null? item.NamespacePrefix+'__'+item.Name : item.Name;
          option.value = item.NamespacePrefix!=null? item.NamespacePrefix+'__'+item.Name : item.Name;
          var select = document.getElementById("classAccesses_select");
          select.appendChild(option);
          
        });
        
        $("div.spanner").removeClass("show");
      })
      .catch(function(error) {
        console.log(error);
        $("div.spanner").removeClass("show");
      })


}

const getPages = document.getElementById('getAllPage');

getPages.addEventListener('click',function(e){

  $("div.spanner").addClass("show");
  console.log('login button');
  fetch('/retrieveAllPage', {method: 'GET'})
      .then(response => response.json())
      .then(data => {

        data.forEach(function(item, index, array) {
          console.log(item, index);
          
          
          var option = document.createElement("option");
          option.text =  item.NamespacePrefix!=null? item.NamespacePrefix+'__'+item.Name : item.Name;
          option.value = item.NamespacePrefix!=null? item.NamespacePrefix+'__'+item.Name : item.Name
          var select = document.getElementById("pageAccesses_select");
          select.appendChild(option);
          
        });
        
        $("div.spanner").removeClass("show");
      })
      .catch(function(error) {
        console.log(error);
        $("div.spanner").removeClass("show");
      })


});

document.querySelectorAll('.aggiungiPartialXML').forEach(item => {
  item.addEventListener('click', event => {

    console.log(initialXMl);
    console.log(itemSelected);
    initialXMl = initialXMl.replace('<items>','');
    initialXMl = initialXMl.replace('</items>','');

    
    console.log(initialXMl);
    

    var valueToAdd = document.getElementById(itemSelected.value+'_select').value;

    console.log(valueToAdd);

    var part =initialXMl.match('<'+itemSelected.text+'>(.*)'+'</'+itemSelected.text+'>');
    
    console.log(part[1]);
    initialXMl = initialXMl.replace(part[1], valueToAdd);
    console.log(initialXMl);

    document.getElementById('textXML').value =  document.getElementById('textXML').value.replace('</items>','') + initialXMl+'</items>';
    document.getElementById('textXML').value = document.getElementById('textXML').value.trim();
  })
})


const button2 = document.getElementById('getProfileInfo');

button2.addEventListener('click', function(e) {
console.log('button was clicked');

let profileToAddIt = document.getElementById('display').value;
if(profileToAddIt==null || profileToAddIt == undefined || profileToAddIt==''){
printMessage('error', 'Seleziona almeno un profilo');
return;
}

console.log(profileToAddIt);
let itemList = profileToAddIt.split(', ');
let itemsProcessed = 0;

let result = 'OK. fatto!';
//$("div.spanner").addClass("show");
itemList.forEach(function(item, index, array) {
  fetch('/retrieveProfileFromOrg', {method: 'POST', headers: {'Content-Type': 'application/json'},body:JSON.stringify({profile: item})})
    .then(response => {
    response.text();
    console.log('ENTRAAAA' + itemsProcessed);
    ++itemsProcessed;})
    .then(data => {
      console.log(data);
      result = data;
      })
    //.catch(error => window.alert(error.message))
    .catch(error => printMessage('error', error.message));
  })
  console.log('ITEMS IN LIST ' + itemList.length + ' PROCESSED ' + itemsProcessed);
  if(itemsProcessed === itemList.length) {
    $("div.spanner").removeClass("show");
  }
});

const buttonCollapse1 = document.getElementById('objectPermissions_button');
buttonCollapse1.addEventListener('click', function(e) {
  $('#objectPermissions').css('pointer-events', '');
});

const buttonCollapse2 = document.getElementById('pageAccesses_button');
buttonCollapse2.addEventListener('click', function(e) {
  $('#pageAccesses').css('pointer-events', '');
});

const buttonCollapse3 = document.getElementById('classAccesses_button');
buttonCollapse3.addEventListener('click', function(e) {
  document.getElementById("permissionList").selectedIndex = 2;
  getXMLfragment(document.getElementById("permissionList").options[2]);
  if(document.getElementById("classAccesses_select").length === 1){//1 = option NONE
    getClasses();
  }
  $('#classAccesses').css('pointer-events', '');
});

const buttonCollapse4 = document.getElementById('customMetadata_button');
buttonCollapse4.addEventListener('click', function(e) {
  $('#customMetadata').css('pointer-events', '');
});


const getAllcustomMetadata = document.getElementById('getAllcustomMetadata');

getAllcustomMetadata.addEventListener('click',function(e){

  $("div.spanner").addClass("show");

  fetch('/retrieveAllcustomMetadata', {method: 'GET'})
      .then(response => response.json())
      .then(data => {

        data.forEach(function(item, index, array) {
          console.log(item, index);
    
          if(item.name.endsWith("_mdt"))
          {
            var option = document.createElement("option");
            option.text = item.name;
            option.value = item.name;
            var select = document.getElementById("customMetadata_select");
            select.appendChild(option);
          }
          
        });
        
        $("div.spanner").removeClass("show");
      })
      .catch(function(error) {
        console.log(error);
        $("div.spanner").removeClass("show");
      })


});

var listOfRows = [];
var custumMetaObj ='';
function showFile(input) {
  let file = input.files[0];
  listOfRows = [];
  $("div.spanner").addClass("show");
  document.getElementById("container").innerHTML = "";
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
        console.log(evt.target.result);
        let data = evt.target.result;
        // start the table
        var html = '<table style="width:100%">';
        
        // split into lines
        var rows = data.split("\n");
        
        // parse lines
        var first_iteration = true;
        
        var fieldsName = [];
        rows.forEach( function getvalues(ourrow) {
          
          
          if(!first_iteration)
          {
          // start a table row
            html += "<tr>";
            
            // split line into columns
            var columns = ourrow.split(";");
            
            var objeElements = new Object();
            columns.forEach( function (elemt,indexRow) {

              html += "<td>" + elemt + "</td>";
              console.log('fieldsName[indexRow] : ',fieldsName[indexRow]);
              console.log('fieldName : ',fieldsName);
              console.log('elemt : ',elemt);
              console.log('from CSDM : ',fieldsCustomMetadata.get(fieldsName[indexRow]));
              console.log('from CSDM : ',fieldsCustomMetadata);
              var objectElemet = new Object();
              objectElemet.value = elemt;
              
              if(fieldsCustomMetadata.get(fieldsName[indexRow].trim()))
                objectElemet.type = fieldsCustomMetadata.get(fieldsName[indexRow].trim()).soapType;

              objeElements[fieldsName[indexRow].trim()] = objectElemet;
            });

            listOfRows.push(objeElements);
            
            
            // close row
            html += "</tr>";
          }
          else
          {
            html += "<tr>";
            
            // split line into columns
            var columns = ourrow.split(";");

            if(columns[0]!='NameRow')
            {
              document.getElementById("container").innerHTML = "La prima colonna deve essere NameRow, con il nome della riga";
              $("div.spanner").removeClass("show");
              throw "La prima colonna deve essere NameRow, con il nome della riga";   
              
            }
            else if(columns[1]!='Protected')
            {
              document.getElementById("container").innerHTML = "La seconda colonna deve essere Protected, con valore true/false";
              $("div.spanner").removeClass("show");
              throw "La seconda colonna deve essere Protected, con valore true/false";   
            }

            columns.forEach( function(elemt2, index) {

              console.log(fieldsCustomMetadata);
              console.log(elemt2);
              if(fieldsCustomMetadata.has(elemt2.trim()) || (index==0 || index==1))
              {
                html += "<th>" + elemt2 + "</th>";
              }
              else
                html += '<th style="border: 4px solid #ff0000">' + elemt2 + '</th>';

              console.log(index);
              console.log(elemt2);
              fieldsName.push(elemt2.trim());
              
            });
            
            // close row
            html += "</tr>";

            first_iteration = false;
          }

          
        });

        console.log(listOfRows);
        // close table
        html += "</table>";
        
        // insert into div
        $('#container').append(html);
        $("div.spanner").removeClass("show");
        $("#uploadFile").removeClass("disabled");
        
    }
    reader.onerror = function (evt) {
        document.getElementById("container").innerHTML = "error reading file";
    }

    
}

var fieldsCustomMetadata = new Map();

function getDefinition(sel){

  var objNameValue =  document.getElementById('customMetadata_select').value;
  console.log(objNameValue);
  custumMetaObj = sel.value;
  fetch('/retrieveAllField/'+objNameValue, {method: 'GET'})
  .then(response => response.json())
  .then(dataM => {

    dataM.forEach(function(item, index, array) {

      console.log('terte',item.name);
      console.log('terte',item.label);

      fieldsCustomMetadata.set(item.name,item);
      
    });
    $('#uploadFileSection').css('pointer-events', '');
    $("div.spanner").removeClass("show");
  })
  .catch(function(error) {
    console.log(error);
    $("div.spanner").removeClass("show");
  })

}


const uploadFileButton = document.getElementById('uploadFile');

uploadFileButton.addEventListener('click',function(e){

  console.log('Calling Upload');

  var inputPathJs = document.getElementById('inputPath').value;

  if(inputPathJs==null || inputPathJs == undefined || inputPathJs=='')
  {
    document.getElementById('error-path').innerHTML = "Inserire un path valido";
    return;
  }

  listOfRows.forEach(function getvalues(ourrow) {

    var listOfRowscustom = [];
    listOfRowscustom.push(ourrow);

    fetch('/addCustomMetadata', {method: 'POST',headers: {'Content-Type': 'application/json'},body:JSON.stringify({ elementsArray: listOfRowscustom,recordName:custumMetaObj})})
    .then(response => response.text())
    .then(data => {
      //console.log(data);
      document.getElementById('textXML').value = data;
    })
    .catch(function(error) {
      //console.log(error);
      $("div.spanner").removeClass("show");
    })

  });
 

});

const deployToOrg = document.getElementById('deployToOrg');

deployToOrg.addEventListener('click',function(e){

  console.log('Calling Upload');
  
  var inputPathJs = document.getElementById('inputPath').value;

  if(inputPathJs==null || inputPathJs == undefined || inputPathJs=='')
  {
    document.getElementById('error-path').innerHTML = "Inserire un path valido";
    return;
  }

  fetch('/deployToOrg', {method: 'POST',headers: {'Content-Type': 'application/json'}})
      .then(response => response.text())
      .then(data => {
        console.log(data);
        document.getElementById('textXML').value = data;
      })
      .catch(function(error) {
        console.log(error);
        $("div.spanner").removeClass("show");
      })

});

const deployToOrgCloudVersion = document.getElementById('deployToOrgCloudVersion');

deployToOrgCloudVersion.addEventListener('click',function(e){

  console.log('Calling Upload');

  var completed = false;
  listOfRows.forEach(function getvalues(ourrow,idx, array) {

    var listOfRowscustom = [];
    listOfRowscustom.push(ourrow);
    
    fetch('/addCustomMetadata', {method: 'POST',headers: {'Content-Type': 'application/json'},body:JSON.stringify({ elementsArray: listOfRowscustom,recordName:custumMetaObj,cloudVersion:true})})
    .then(response => {console.log('end1');completed = true;})
    .then(data => {
      completed = true;
      

      if (idx === array.length - 1){ 

        console.log('end12');

        
        fetch('/deployToOrgCloudVersion', {method: 'POST',headers: {'Content-Type': 'application/json'}})
        .then(response => response.text())
        .then(data => {
          console.log(data);
          document.getElementById('textXML').value = data;
        })
        .catch(function(error) {
          console.log(error);
          $("div.spanner").removeClass("show");
        })
      }
      
    })
    .catch(function(error) {
      //console.log(error);
      $("div.spanner").removeClass("show");
    })
    
    
  });

    
  


  

});

