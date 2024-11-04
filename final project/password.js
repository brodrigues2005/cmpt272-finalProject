

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

// async function comparePascodes
async function comparePascodes(passCode1,passCode2){
    const Hash1 = await fetchHash(passCode1);
    const Hash2 = await fetchHash(passCode2);

   return Hash1 === Hash2;
    
}

const Passcode = "ANWSB";

//Pull this information from window popup after they select modify or delete
var userEntry = "ANWSB";

comparePascodes(Passcode,userEntry).then(result =>{
    EQUAL = result;
    console.log(EQUAL);


    //if EQUAL === true
    //Delete report or delete report and bring them to form to make modification

    //if EQual === false
    //Window popup saying wrong password was submitted and do nothing
});

