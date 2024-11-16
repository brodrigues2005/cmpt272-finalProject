

async function fetchHash(passCode){

    try{

        

        var Request = {
            method: 'POST',
            body: passCode,
            redirect: 'follow'
        }

        const hashedCode = await fetch("https://api.hashify.net/hash/md4/hex", Request);
        const hashedCode2 = await hashedCode.json();
        return hashedCode2.Digest;

    }

    catch(fetchError){
        console.log(fetchError);
    }



}


const Passcode = "ANWSB";

localStorage.setItem("PASSCODE",Passcode);

// async function comparePascodes
async function comparePascodes(passCode1,passCode2, command){
    const Hash1 = await fetchHash(passCode1);
    const Hash2 = await fetchHash(passCode2);

    
    if(Hash1 === Hash2){
        window.alert("correct");
    }

    else{
        window.alert("incorrect");
    }
   return Hash1 === Hash2;
    
}








//Pull this information from window popup after they select modify, delete, or resolve status
var userEntry = "ANWSB";


document.getElementById("reportList")

var command = "delete";




// comparePascodes(Passcode,userEntry, command).then(result =>{
//     EQUAL = result;
//     console.log(EQUAL);


//     //if EQUAL === true
//     //Delete report, make modification, or resolve status
//     if(Equal == true){
//         if(command ===  "DELETE"){
//             //Something like this
//             // document.getElementById("reportList").removeChild(listitem);
//             // delete report;

//             //Delete specific report for reports array
//             var index = getItem("deleteIndex")
//             var reports = JSON.parse(localStorage.getItem('reports'));
//             reports.splice(index,index);
//             localStorage.setItem('reports', JSON.stringify(reports));
//         }

//         else if (command === "RESOLVE"){
//             var reports = JSON.parse(localStorage.getItem('reports'));
//             reports[index].status = "Resolved";
//             localStorage.setItem('reports', JSON.stringify(reports));
//         }

//         else if (command === "Modify"){
            
//         }
        
//     }
//     //if EQual === false
//     //Window popup saying wrong password was submitted and do nothing

//     if(Equal == false){
//         window.prompt("Error: Wrong Password inputed");
//     }
<<<<<<< HEAD

// });
=======
>>>>>>> Namith

// });