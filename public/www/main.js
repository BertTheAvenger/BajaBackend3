let url = "/api/getdatapoint/";
let url2 = "/api/getdatapoints/";


window.onload = () => {
    document.getElementById("btnRequestData").onclick = () => {
        let xhr = new XMLHttpRequest();



        xhr.open("POST", url2, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let json = JSON.parse(xhr.responseText);
                console.log(json);
            }
        };

        let data = JSON.stringify({times: document.getElementById("inputTimeMs").value} );
        xhr.send(data);
    };


};
