let url = "/api/getdata/";


window.onload = () => {
    document.getElementById("btnRequestData").onclick = () => {
        let xhr = new XMLHttpRequest();



        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 400)) {
                let json = JSON.parse(xhr.responseText);
                console.log(json);
                let tbl = document.getElementById("dataTable");
                tbl.innerHTML = "";
                let header = document.createElement("tr");
                let typeHeader = document.createElement("th");
                let valHeader = document.createElement("th");

                typeHeader.innerHTML = "ID";
                valHeader.innerHTML = "Value";

                header.appendChild(typeHeader);
                header.appendChild(valHeader);
                tbl.appendChild(header);

                json.forEach(v => {
                   let sr = document.createElement("tr");
                   let sh = document.createElement("th");
                   sh.innerHTML = "Sensor";
                   sr.appendChild(sh);
                   tbl.appendChild(sr);
                   Object.keys(v).forEach(s => {
                       let sr = document.createElement("tr");
                       let sId = document.createElement("td");
                       let sVal = document.createElement("td");
                       sId.innerHTML = s;
                       sVal.innerHTML = v[s];
                       sr.appendChild(sId);
                       sr.appendChild(sVal);
                       tbl.appendChild(sr);
                   });
                });

                console.log("K");

                //document.createElement("")
            }
        };

        let data = JSON.stringify({
            times: [Number(document.getElementById("inputTimeMs").value), 1291],
            run: "231e90d609326f211dc02339b0dbf3ee",
        }) ; //{times: document.getElementById("inputTimeMs").value}
        xhr.send(data);
    };


};
