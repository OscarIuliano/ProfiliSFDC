console.log('Client-side code running');

var permissionAvailable;
var initialXMl;
var itemSelected;
 
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
        document.getElementById("display").style = 'height: 353px;width: 506px;margin: 0px;';
        data.forEach(function(item, index, array) {
          console.log(item, index);

          var option = document.createElement("option");
          option.text = item;
          option.value = item;
          var select = document.getElementById("profileList");
          select.appendChild(option);
        });
      })
      .catch(function(error) {
        console.log(error);
      })
});



const selectItem = document.getElementById('permissionList');

selectItem.addEventListener('change',function(e){

  alert(e.target.value);
  

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
});

const aggiungi = document.getElementById('addVisibility');
var opts = [], opt;

aggiungi.addEventListener('click', function(e){

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
  }
  if(profileToAddIt==null || profileToAddIt == undefined || profileToAddIt == '')
  {
    document.getElementById('error-profile').innerHTML = "Nessun profilo selezionato!";
    $("div.spanner").removeClass("show");
    return;
  }

  let itemList = profileToAddIt.split(', ');
  let result = 'oK fatto!';
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
  alert(result);
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
  }
  if(profileToAddIt==null || profileToAddIt == undefined || profileToAddIt == '')
  {
    document.getElementById('error-profile').innerHTML = "Nessun profilo selezionato!";
    $("div.spanner").removeClass("show");
    return;
  }

  let itemList = profileToAddIt.split(', ');
  let result = 'oK fatto!';
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
  alert(result);
});

document.getElementById('profileList').onchange = function(e) {
  // get reference to display textarea
  var display = document.getElementById('display');
  display.innerHTML = ''; // reset
  
  // callback fn handles selected options
  getSelectedOptions(this, callback);
  
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

const loginButton = document.getElementById('loginBtton');

loginButton.addEventListener('click',function(e){

  var usernameJs = document.getElementById('username').value;
  var passwordJs = document.getElementById('password').value;
  $("div.spanner").addClass("show");
  console.log('login button');
  fetch('/loginSFDC', {method: 'POST',headers: {'Content-Type': 'application/json'},body:JSON.stringify({ username: usernameJs,password:passwordJs})})
      .then(response => response.text())
      .then(data => {
        document.getElementById('login-result').innerHTML = data;
        $("div.spanner").removeClass("show");
      })
      .catch(function(error) {
        console.log(error);
        $("div.spanner").removeClass("show");
      })


});

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

getClass.addEventListener('click',function(e){

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


});

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