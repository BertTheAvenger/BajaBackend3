let url = "/api/getdatapoint/";

window.onload = () => {
    document.getElementById("btnRequestData").onclick = () => {
        let xhr = new XMLHttpRequest();



        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let json = JSON.parse(xhr.responseText);
                console.log(json);
            }
        };

        let data = JSON.stringify({time: document.getElementById("inputTimeMs").value} );
        xhr.send(data);
    };


};
