// Set localStorage
let phoneBook = [];
let editIndex = null;

async function init() {
  phoneBook = await loadContacts();
  setupsearch();
}
init();

// get element from HTML
const searchInput = document.querySelector("#searchInput");
const searchResult = document.querySelector("#searchResult");
const userInput = document.querySelector(".UserName");
const phoneInput = document.querySelector(".phone");
const companyInput = document.querySelector(".company");
const btnSave = document.querySelector(".save");
const btnEdit = document.querySelector(".edit");
const btbCancel = document.querySelector(".cancel");
const btndelete = document.querySelector(".delete");
const btnDownload = document.querySelector(".download");
const table = document.querySelector(".table");
const tableBody = document.querySelector("#tableBody");
const userOutput = document.querySelector(".userOutput");
const phonOutput = document.querySelector(".phonOutput");
const companyOutput = document.querySelector(".companyOutput");
const checkError = document.querySelector("#Error");

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

//Search input
function setupsearch() {
  if (!searchInput || !searchResult) return;

  //Live Search
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.trim();

    if (value === "") {
      searchResult.style.display = "none";
      searchResult.innerHTML = "";
      return;
    }

    // contact filter
    const filtered = phoneBook.filter(
      (contact) =>
        contact.name.includes(value) ||
        contact.phone.includes(value) ||
        contact.company.includes(value)
    );
    //If We hadnt any result
    if (filtered.length === 0) {
      searchResult.innerHTML = `<div class="search-item" style="color:#999; text-align:center;">❌ نتیجه‌ای یافت نشد</div>`;
      searchResult.style.display = "block";
      return;
    }

    //searchResult
    searchResult.innerHTML = filtered
      .map(
        (contact) =>
          `<div class="search-item" 
             data-name="${contact.name}" 
             data-phone="${contact.phone}" 
             data-company="${contact.company || ""}">
             👤: ${contact.name} <br> 
             📞: ${contact.phone}<br>
             🏢: ${contact.company}
        </div> `
      )
      .join("");
    searchResult.style.display = "block";

    //Select the Result
    document.querySelectorAll(".search-item").forEach((item) => {
      item.addEventListener("click", () => {
        const name = item.getAttribute("data-name");
        const phone = item.getAttribute("data-phone");
        const company = item.getAttribute("data-company");

        userInput.value = name;
        phoneInput.value = phone;
        companyInput.value = company;

        // AMK_COMMENT: we can include index in each item to reduce data fetch round-trips.
        const originalIndex = phoneBook.findIndex((c) => c.phone === phone);
        editIndex = originalIndex;

        btnSave.disabled = true;
        btnEdit.disabled = false;

        searchResult.style.display = "none";
        searchInput.value = "";
        searchResult.innerHTML = "";
      });
    });
  });
  //close the searchbox after select
  document.addEventListener("click", (e) => {
    if (!searchResult.contains(e.target) && e.target !== searchInput) {
      searchResult.style.display = "none";
    }
  });
}

//form for contact information

function localContactToForm(index) {
  if (index === null || index < 0 || index >= phoneBook.length) return;
  let contact = phoneBook[index];
  userInput.value = contact.name;
  phoneInput.value = contact.phone;
  companyInput.value = contact.company;
  editIndex = index;
  // delete search result
  searchResult.innerHTML = "";
  searchInput.value = "";
}
//delete form
function clearform() {
  userInput.value = "";
  phoneInput.value = "";
  companyInput.value = "";
  editIndex = null;
  btnSave.disabled = false;
  btnEdit.disabled = true;
  userOutput.innerHTML = "";
  phonOutput.innerHTML = "";
  companyOutput.innerHTML = "";
}
//button Save

btnSave.addEventListener("click", function () {
  const nameInputValue = userInput.value.trim();
  const phoneInputValue = phoneInput.value.trim();
  const companyInputValue = companyInput.value.trim();
  userOutput.innerHTML = "";
  phonOutput.innerHTML = "";

  if (nameInputValue === "" || phoneInputValue === "") {
    if (nameInputValue === "")
      checkError.innerHTML = "نام و نام خانوادگی نباید خالی باشد.";
    if (phoneInputValue === "")
      checkError.innerHTML = "شماره تماس نباید خالی باشد.";
    if (companyInputValue === "")
      checkError.innerHTML = "اسم مجموعه نباید خالی باشد.";
    setTimeout(() => {
      checkError.innerHTML = "";
    }, 3000);
    return;
  }

  // duplicate phoneInputValue Number
  let isDuplicate = false;
  // AMK_COMMENT - same as the for loop.
  isDuplicate = phoneBook.some((contact) => contact.phone === phoneInputValue);
  //   for (let i = 0; i < phoneBook.length; i++) {
  //     if (phoneBook[i].phone === phoneInputValue) {
  //       isDuplicate = true;
  //       break;
  //     }
  //   }

  if (isDuplicate) {
    checkError.innerHTML = ".شماره همراه تکراری است";
    setTimeout(() => {
      checkError.innerHTML = "";
    }, 3000);
    return;
  }

  const newcontact = {
    name: nameInputValue,
    phone: phoneInputValue,
    company: companyInputValue || "شخصی",
  };
  phoneBook.push(newcontact);
  clearform();
  saveToLocalStorage();
  checkError.innerHTML = "✅ مخاطب با موفقیت ذخیره شد. ";

  setTimeout(() => {
    checkError.innerHTML = "";
  }, 3000);
});

//button Edite
btnEdit.addEventListener("click", function () {
  if (editIndex === null) {
    checkError.innerHTML = "لطفا ابتدا یک مخاطب را از نتایج جستجو انتخاب کنید";
    checkError.innerHTML = "✅ مخاطب با موفقیت ذخیره شد.";
    setTimeout(() => {
      checkError.innerHTML = "";
    }, 3000);
    return;
  }
  const nameInputValue = userInput.value.trim();
  const phoneInputValue = phoneInput.value.trim();
  const companyInputValue = companyInput.value.trim();

  if (nameInputValue === "" || phoneInputValue === "") {
    userOutput.innerHTML = "نام و نام خانوادگی نباید خالی باشد.";
    phonOutput.innerHTML = "شماره تماس نباید خالی باشد.";
    setTimeout(() => {
      userOutput.innerHTML = "";
      phonOutput.innerHTML = "";
    }, 3000);
    return;
  }
  phoneBook[editIndex] = {
    name: nameInputValue,
    phone: phoneInputValue,
    company: companyInputValue || "شخصی",
  };

  saveToLocalStorage();
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

btndelete.addEventListener("click", function () {
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
  saveToLocalStorage();
  clearform();
  editIndex = null;
  searchResult.innerHTML = "";
  searchInput.value = "";
  checkError.innerHTML = "مخاطب حذف شد.";

  setTimeout(() => {
    checkError.innerHTML = "";
  }, 2000);
});

btnDownload.addEventListener("click", () => {
  downloadFile(phoneBook, "contacts.json");
});


