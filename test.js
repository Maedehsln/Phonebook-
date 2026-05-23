let preview = document.getElementById("preview");
let input = document.getElementById("input");
let submit = document.getElementById("submit");

input.addEventListener("input", (e) => {
  preview.innerHTML = e.target.value;
});

submit.addEventListener("click", (e) => {});

function saveToFile(data, filename = "contacts.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

fetch("storage.json")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    preview.innerHTML = JSON.stringify(data);
    localStorage.setItem("json", JSON.stringify(data));
  })
  .catch((error) =>
    console.error(`Error: ${error} (maybe you are running with file url !!!)`)
  );

let data = JSON.parse(localStorage.getItem("json"));
saveToFile(data, "contacts.json");
