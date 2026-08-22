async function loadContacts() {
  if (window.electronAPI) {
    return await window.electronAPI.loadContacts();
  }

  const contacts = localStorage.getItem("contacts");

  return contacts ? JSON.parse(contacts) : [];
}

async function saveContacts(contacts) {
  if (window.electronAPI) {
    await window.electronAPI.saveContacts(contacts);
    return;
  }

  localStorage.setItem("contacts", JSON.stringify(contacts));
}
// get element from HTML
const searchInput = document.querySelector("#searchInput");
const searchResult = document.querySelector("#searchResult");
const userInput = document.querySelector(".UserName");
// const phoneInputs = document.querySelectorAll(".phone");
const companyInput = document.querySelector(".company");
const btnSave = document.querySelector(".save");
const btnEdit = document.querySelector(".edit");
const btbCancel = document.querySelector(".cancel");
const btndelete = document.querySelector(".delete");
const table = document.querySelector(".table");
const tableBody = document.querySelector("#tableBody");
const userOutput = document.querySelector(".userOutput");
const phonOutput = document.querySelector(".phonOutput");
const companyOutput = document.querySelector(".companyOutput");
const checkError = document.querySelector("#Error");
const phonInputsRow = document.querySelector('.phonInputsRow');


// Set localStorage
let phoneBook = [];
let editIndex = null;

async function init() {
  phoneBook = (await loadContacts())||[];
  setupsearch();
}
init();


// Save To LocalStorage
async function saveToLocalStorage() {
  await saveContacts(phoneBook);
}

// Save Storage to file
function downloadFile(data, filename = "contacts.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
phonInputsRow.addEventListener('click',function(e){

  if (e.target.classList.contains("add-phone")){

    const row = document.createElement('div');
    row.classList.add('phone-row');

    row.innerHTML= `                       
                    <input type="text" name="phon" class="phone">
                    <button type="button" class="remove-phone"> - </button>
                   `;

    phonInputsRow.append(row)

  }if (e.target.classList.contains('remove-phone')){
    const removeRow = e.target.parentElement;
    removeRow.remove();
  }
})
//Search input
function setupsearch() {
  if (!searchInput || !searchResult) return;

  //Live Search
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.trim().toLowerCase();

    if (value === "") {
      searchResult.style.display = "none";
      searchResult.innerHTML = "";
      return;
    }

    // contact filter
    const filtered = phoneBook.filter((contact) =>
        contact.name?.toLowerCase().includes(value) ||
        contact.phoneList?.some((phone)=>
        phone.includes(value)) ||
        contact.company?.toLowerCase().includes(value)
    );
    //If We hadnt any result
    if (filtered.length === 0) {
      searchResult.innerHTML = `<div class="search-item no-result" style="color:#999; text-align:center;">❌ نتیجه‌ای یافت نشد</div>`;
      searchResult.style.display = "block";
      return;
    }

    //searchResult
    searchResult.innerHTML = filtered.map((contact) =>{
        const index = phoneBook.indexOf(contact);
    
        return`    
          <div class="search-item" 
          data-index="${index}">
      
             👤: ${contact.name} <br>
             📞: ${contact.phoneList.join(',')}<br>
             🏢: ${contact.company || ""}
      
          </div> `
     }).join("");
    searchResult.style.display = "block";
    });

    //Select the Result
      searchResult.addEventListener("click", (e) => {
        const item =e.target.closest ('.search-item')
        if (!item || item.classList.contains("no-result")) return;

        // const name = item.getAttribute("data-name");
        // const phone = item.getAttribute("data-phone");
        // const company = item.getAttribute("data-company");

          const index = item.getAttribute("data-index");
          const contact = phoneBook[Number(index)];
          userInput.value=contact.name;
          companyInput.value=contact.company;
          setPhoneInputs(contact.phoneList);
          editIndex = Number(index);          
          
        // const originalIndex = phoneBook.findIndex((contact) => 
        //   contact.name ===name && contact.phoneList?.some((phoneNumber)=>
        //   phoneList.includes(phoneNumber)));

        // editIndex = originalIndex;

        btnSave.disabled = true;
        btnEdit.disabled = false;

        searchResult.style.display = "none";
        searchInput.value = "";
        searchResult.innerHTML = "";
      });
  //   });
  };
  //close the searchbox after select
  document.addEventListener("click", (e) => {
    if (!searchResult.contains(e.target) && e.target !== searchInput) {
      searchResult.style.display = "none";
    }
  });

function setPhoneInputs(phoneList = []) {
  // حذف input های اضافه
  const phoneRows = phonInputsRow.querySelectorAll(".phone-row");

  phoneRows.forEach((row, index) => {
    if (index > 0) {
      row.remove();
    }
  });

  // اولین input
  const firstPhoneInput = phonInputsRow.querySelector(".phone");

  if (!firstPhoneInput) return;

  firstPhoneInput.value = phoneList[0] || "";

  // ساخت input برای شماره‌های بعدی
  phoneList.slice(1).forEach((phone) => {
    const row = document.createElement("div");

    row.classList.add("phone-row");

    row.innerHTML = `
      <input
        type="text"
        name="phon"
        class="phone"
        value="${phone}"
      >

      <button type="button" class="remove-phone">-</button>
    `;

    phonInputsRow.append(row);
  });
}
//form for contact information

function localContactToForm(index) {
  if (index === null || index < 0 || index >= phoneBook.length) return;
  const contact = phoneBook[index];
  userInput.value = contact.name;
  setPhoneInputs(contact.phoneList);

  companyInput.value = contact.company;
  editIndex = index;
  // delete search result
  searchResult.innerHTML = "";
  searchInput.value = "";
}
//delete form
function clearform() {
  userInput.value = "";
  setPhoneInputs([]);
  companyInput.value = "";
  editIndex = null;
  btnSave.disabled = false;
  btnEdit.disabled = true;
  userOutput.innerHTML = "";
  phonOutput.innerHTML = "";
  companyOutput.innerHTML = "";
}

//validationContact
function validationContact(name,phoneInputValue){
  const nameRegex = /^[a-zA-Zآ-ی\s]+$/;
  const phoneRegex = /^[0-9۰-۹]+$/;
  
  if (!nameRegex.test(name)){
    userOutput.innerHTML="نام و نام خانوادگی باید فقط شامل حروف باشد.";
    return false ;
  }
  if(phoneInputValue.some((phone)=>!phoneRegex.test(phone))){
    phonOutput.innerHTML="شماره تماس باید فقط شامل عدد باشد.";
    return false ;
  }
  return true;
}


//button Save

btnSave.addEventListener("click",async function () {
  const nameInputValue = userInput.value.trim();
  // const phoneInputValue = phoneInput.value.trim();
  const companyInputValue = companyInput.value.trim();
  userOutput.innerHTML = "";
  phonOutput.innerHTML = "";
  const phoneInputs = document.querySelectorAll(".phone");
  const phoneInputValue = Array.from(phoneInputs).map((input)=>{
    return input.value.trim();
  })
  if (nameInputValue === "") {
  userOutput.innerHTML = "نام و نام خانوادگی نباید خالی باشد.";
}

if (phoneInputValue.some((phone)=> !phone)) {
  phonOutput.innerHTML = "شماره تماس نباید خالی باشد.";
}

if (nameInputValue === "" || phoneInputValue.some((phone)=> !phone)) {
  setTimeout(() => {
    userOutput.innerHTML = "";
    phonOutput.innerHTML = "";
  }, 3000);

  return;
}
  if (!validationContact(nameInputValue , phoneInputValue)){
    setTimeout(()=>{
      userOutput.innerHTML = "";
      phonOutput.innerHTML = "";
    },3000);
    return;
  }
  // duplicate phoneInputValue Number
  let isDuplicate = false;
  // AMK_COMMENT - same as the for loop.
  isDuplicate = phoneBook.some((contact) => {
    return phoneInputValue.some((phone)=>{
      return contact.phoneList.includes(phone)
    })});
  

  if (isDuplicate) {
    phonOutput.innerHTML = ".شماره همراه تکراری است";
    setTimeout(() => {
      phonOutput.innerHTML = "";
    }, 3000);
    return;
  }

  const newcontact = {
    name: nameInputValue,
    phoneList: phoneInputValue ,
    company: companyInputValue || "شخصی",
  };

  phoneBook.push(newcontact);
  await saveToLocalStorage();
  clearform();

  checkError.innerHTML = "✅ مخاطب با موفقیت ذخیره شد. ";
  setTimeout(() => {
    checkError.innerHTML = "";
  }, 3000);
});

//button Edite
btnEdit.addEventListener("click", async function () {
  if (editIndex === null) {
    checkError.innerHTML = "لطفا ابتدا یک مخاطب را از نتایج جستجو انتخاب کنید";

    setTimeout(() => {
      checkError.innerHTML = "";
    }, 3000);
    return;
  }
const phoneInputs = document.querySelectorAll(".phone");

const phoneInputValue = Array.from(phoneInputs).map((input) => {
  return input.value.trim();
});
  const nameInputValue = userInput.value.trim();
  const companyInputValue = companyInput.value.trim();

  // if (nameInputValue === "" || phoneInputValue === "") {
  //   userOutput.innerHTML = "نام و نام خانوادگی نباید خالی باشد.";
  //   phonOutput.innerHTML = "شماره تماس نباید خالی باشد.";
  //   setTimeout(() => {
  //     userOutput.innerHTML = "";
  //     phonOutput.innerHTML = "";
  //   }, 3000);
  //   return;
  // }
  if (nameInputValue === "") {
  userOutput.innerHTML = "نام و نام خانوادگی نباید خالی باشد.";
}

if (phoneInputValue.some((phone)=> !phone)) {
  phonOutput.innerHTML = "شماره تماس نباید خالی باشد.";
}

if (nameInputValue === "" || phoneInputValue.some((phone)=> !phone)) {
  setTimeout(() => {
    userOutput.innerHTML = "";
    phonOutput.innerHTML = "";
  }, 3000);

  return;
}
    if (!validationContact(nameInputValue , phoneInputValue)){
    setTimeout(()=>{
      userOutput.innerHTML = "";
      phonOutput.innerHTML = "";
    },3000);
    return;
  }

  const isDuplicate = phoneBook.some((contact, index) => {
  if (index === editIndex) return false;

  return phoneInputValue.some((phone) =>
    contact.phoneList.includes(phone)
  );
});

if (isDuplicate) {
  phonOutput.innerHTML = "شماره همراه تکراری است.";

  setTimeout(() => {
    phonOutput.innerHTML = "";
  }, 3000);

  return;
}
  phoneBook[editIndex] = {
    name: nameInputValue,
    phoneList: phoneInputValue,
    company: companyInputValue || "شخصی",
  };

  await saveToLocalStorage();
  clearform();
  editIndex = null;
  searchResult.innerHTML = "";
  searchInput.value = "";
  checkError.innerHTML = "مخاطب با موفقیت ویرایش شد.";
  setTimeout(() => {
    checkError.innerHTML = "";
  }, 3000);
});

//button Cancel

btbCancel.addEventListener("click", function () {
  clearform();
  editIndex = null;
  searchResult.innerHTML = "";
  searchInput.value = "";
});

//button Delete

btndelete.addEventListener("click", async function () {
  if (editIndex === null) {
    checkError.innerHTML = "لطفا ابتدا یک مخاطب را برای حذف انتخاب کنید .";
    setTimeout(() => {
      checkError.innerHTML = "";
    }, 3000);
    return;
  }
  const confrimDelete = confirm(
    `آیا از حذف ${phoneBook[editIndex].name} مطمئن هستید ؟`
  );
  if (!confrimDelete) return;
  phoneBook.splice(editIndex, 1);
  await saveToLocalStorage();
  clearform();
  editIndex = null;
  searchResult.innerHTML = "";
  searchInput.value = "";
  checkError.innerHTML = "مخاطب حذف شد.";

  setTimeout(() => {
    checkError.innerHTML = "";
  }, 2000);
});



