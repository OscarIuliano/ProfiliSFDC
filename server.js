console.log('Server-side code running');
const PORT = process.env.PORT || 8080;

const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const format = require('xml-formatter');
const sf = require('node-salesforce');
const path = require('path');



var conn = new sf.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl : 'https://test.salesforce.com'
});

let profilePath = '';
let permissionFile = '';

// serve files from the public directory
app.use(express.static('public'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


// start the express web server listening on 8080
app.listen(PORT, () => {
  console.log('listening on 8080');
});

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/profileList', (req, res)=>{

    console.log('ProfileListMethod');
    console.log(req.body);

    var array = [];

    profilePath = req.body.path;

    //var filePath = path.join(__dirname, profilePath);

    //console.log(filePath);
  
    try
    {
      fs.readdir(profilePath, (err, files) => {

        
        try
        {
          files.forEach(file => {
            console.log(file);
            array.push(file);
          });
        }
        catch(e)
        { 
          array.push('Errore nel path');
          return res.send(array);
        }
        

        console.log(array);

        return res.send(array);

      });
    }
    catch(e)
    { 
      array.push('Errore nel path');
      return res.send(array);
    }
    
});

app.get('/getPermission',(req,res)=>{

    fs.readFile(__dirname+'/public/config/Permissions.json', 'utf8', function(err, data){ 
      
        // Display the file content 
        console.log(data); 
        permissionFile = data;
        return res.send(data);
    });

});

app.get('/getConfiguration',(req,res)=>{

    let fileName = req.query.fileName;
    fs.readFile(__dirname+'/public/config/'+fileName+'.xml', 'utf8', function(err, data){ 
      
        // Display the file content 
        console.log(data); 
        return res.send(data);
    });

});

app.post('/addItemsInProfile',(req,res)=>{

  let profilelist = req.body.profile;
  let permission = req.body.permission;
  let permissionValue =req.body.permissionValue;


  let action =req.body.action;

  var parser = new xml2js.Parser(xml2js.defaults["0.2"]);
  var jsonPermissionConf = JSON.parse(permissionFile);

    try
    {
      fs.readFile(profilePath+'/'+profilelist, 'utf8', function(err, data){ 

        parser.parseString(data, function(err, result) {
          if (err) console.log(err);
          // here we log the results of our xml string conversion
  
          var json = result;
          // edit the first node’s weight and set it to 99
  
          var parserNewNode = new xml2js.Parser(xml2js.defaults["0.2"]);
          let elementToAdd = '';
          parserNewNode.parseString(permissionValue, function(err, result2) {
            elementToAdd = result2;
  
            
  
            var elementKey = '';
            jsonPermissionConf.forEach(function(itemPerm, index, array) {
  
              if(itemPerm.key == permission)
                elementKey = itemPerm.value;
  
            });
  
            //console.log('permission ? ',json.Profile[permission]);
            if(json.Profile[permission]==undefined)
            {
              json.Profile[permission] = elementToAdd['items'][permission][0];
              
            }
            else
            {
              //console.log('permission1 ? ',json.Profile[permission]);
              var arrayToPush = [];
              elementToAdd['items'][permission].forEach(function(itemToadd,indexItemToadd,arrayItemToAdd){
                //console.log('oooo '+indexItemToadd);
                let doAction = true;
                json.Profile[permission].forEach(function(itemExist, indexItemExist, arrayExist) {
                  //console.log('itemExist ',itemExist[elementKey]);
                  //console.log('elementKey ',elementKey);
                  //console.log('itemToadd ',itemToadd[elementKey]);
                  if(itemExist[elementKey]!=undefined )
                  {                   
                    if( itemToadd[elementKey][0] == itemExist[elementKey][0])
                    { 
                      //console.log(json.Profile[permission][indexItemExist]);
                      if(action == 'remove')
                        json.Profile[permission].splice(indexItemExist, 1);
                      else
                        json.Profile[permission][indexItemExist]  = elementToAdd['items'][permission][indexItemToadd];
                      
                        doAction = false;
    
                    } 
                }
    
                });
                //console.log(doAction);
                if(doAction)
                  arrayToPush.push(elementToAdd['items'][permission][indexItemToadd]);
                
              });
    
              //console.log(arrayToPush);
              if(action != 'remove')
              {
                arrayToPush.forEach(function(newItem, newIndex, newArray) 
                {
                  json.Profile[permission].push(newItem);
                
                });
              }

              //return res.send(json.Profile[permission]);
              json.Profile[permission].sort((a,b) => (a[elementKey] > b[elementKey]) ? 1 : ((b[elementKey] > a[elementKey]) ? -1 : 0)); 

            }


            var builder = new xml2js.Builder();
            var xml = builder.buildObject(json);
  
            var formattedXml = format(xml, {
                indentation: '    ',        
                filter: (node) => node.type !== 'Comment', 
                collapseContent: true,
                lineSeparator: '\n'
            });

            //formattedXml = formattedXml.replace('&#xD;', '');
  
            fs.writeFile(profilePath+'/'+profilelist, formattedXml, function (err) {
              if (err) return console.log(err);
              console.log('salvato il file');
            });
            
            return res.send('OK Done');
  
          });
  
          
        });
  
      });
    }
    catch(e)
    {
      return res.send('c\'è stato un errore');
    }
  
   
});



app.post('/loginSFDC', (req,res) =>{

  var username = req.body.username;
  var password = req.body.password;
   
console.log('login button');
  conn.login(username, password, function(err, userInfo) {
    if (err) { return res.send('Abbiamo riscontrato un errore: '+err); }
    // Now you can get the access token and instance URL information.
    // Save them to establish connection next time.
    console.log(conn.accessToken);
    console.log(conn.instanceUrl);
    // logged in user property
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    // ...

    return res.send('Sei loggato in :'+conn.instanceUrl);
  });

});

app.get('/retrieveAllSObject',(req,res)=>{

  conn.describeGlobal(function(err, result) {
  if (err) { return console.error(err); }
  console.log('Num of SObjects : ' + result.sobjects.length);

  return res.send(result.sobjects);
  // ...
});

});


app.get('/retrieveAllClasses',(req,res)=>{

  conn.query("Select Id,Name,NamespacePrefix From ApexClass order by NamespacePrefix ASC", function(err, result) {
    if (err) { return console.error(err); }
    console.log("total : " + result.totalSize);
    console.log("fetched : " + result.records.length);
    return res.send(result.records);
  });
  // ...
});

app.get('/retrieveAllPage',(req,res)=>{

  conn.query("Select Id,Name,NamespacePrefix From ApexPage order by NamespacePrefix ASC", function(err, result) {
    if (err) { return console.error(err); }
    console.log("total : " + result.totalSize);
    console.log("fetched : " + result.records.length);
    return res.send(result.records);
  });
  
  // ...
});

app.get('/retrieveAllField/:object',(req,res)=>{

  let objectName = req.params.object;

  conn.sobject(objectName).describe$(function(err, meta) {
    if (err) { return console.error(err); }
    console.log('Label : ' + meta.label);
    console.log('Num of Fields : ' + meta.fields.length);

    return res.send(meta.fields);
    // ...
  }); 
});






