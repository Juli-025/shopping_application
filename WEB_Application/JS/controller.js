// controller.js
import { todoModel } from "./model.js";
import { todoView } from "./view.js";

const todoController = {
    // State variables for edit modes:
    currentEditingItemId: null,
    currentEditingFriendId: null,
    currentEditingTag: null,
    currentEditingPurchaseId: null,
    currentEditingListId: null,

    // Persistent shopping cart
    shoppingCart: {},

    init() {
        // Set the default section to shopping
        todoModel.setActiveSection("shopping");
        todoView.update(todoModel.getActiveSection());

        // Ensure that the shopping menu item is marked as active
        document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));
        const shoppingLink = document.querySelector('.nav-link[href="#shopping"]');
        if (shoppingLink) {
            shoppingLink.classList.add("active");
        }

        // Delegated listener: update the shopping filter dropdown live
        document.addEventListener("change", (event) => {
            if (event.target && event.target.id === "shoppingTagFilter") {
                this.loadAvailableItems();
            }
        });

        // Navigation: add click listeners to all navigation links
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                // Remove 'active' from all nav links and add it to the clicked link
                document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
                link.classList.add("active");

                const section = link.getAttribute("href").substring(1);
                todoModel.setActiveSection(section);
                todoView.update(section);
                this.setupSectionListeners(section);
                // If the section is "list", render the purchase selection for the list
                if (section === "list") {
                    todoView.renderPurchaseSelectionForList(todoModel.getPurchases());
                }
            });
        });

        // Delegated listener in the purchase selection container, lists
        const purchaseSelectionContainer = document.getElementById("purchaseSelectionContainer");
        if (purchaseSelectionContainer) {
            purchaseSelectionContainer.addEventListener("change", () => {
                const selectedIds = [];
                document.querySelectorAll("#purchaseSelectionContainer .purchase-select:checked")
                    .forEach((cb) => selectedIds.push(cb.dataset.purchaseId));
                todoView.updateListPurchases(selectedIds, todoModel.getPurchases());
            });
        }

        // Setup edit listeners for friends, tags, purchases, lists, items
        this.setupEditListeners();

        // Setup section listeners based on the current active section
        this.setupSectionListeners(todoModel.getActiveSection());

    },

    // Set up listeners based on the current section
    setupSectionListeners(section) {
        const fabBtn = document.getElementById("fabBtn");
        if (section === "shopping") {
            fabBtn.onclick = () => this.toggleForm("shoppingForm");
            this.setupShoppingListeners();
        } else if (section === "items") {
            fabBtn.onclick = () => this.toggleForm("cardForm");
            this.setupItemsListeners();
        } else if (section === "tag") {
            fabBtn.onclick = () => this.toggleForm("tagForm");
            this.setupTagsListeners();
        } else if (section === "list") {
            fabBtn.onclick = () => this.toggleForm("listForm");
            this.setupListListeners();
        } else if (section === "friends") {
            fabBtn.onclick = () => this.toggleForm("friendsForm");
            this.setupFriendsListeners();
        }
    },

    // Toggle the display of a form show/hide
    toggleForm(formId) {
        const form = document.getElementById(formId);
        form.style.display = form.style.display === "none" ? "block" : "none";
        // If showing the list form, render the purchase selection for lists
        if (formId === "listForm" && form.style.display === "block") {
            todoView.renderPurchaseSelectionForList(todoModel.getPurchases());
        }
    },

    // Clear all inputs in a form and hide it
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.querySelectorAll("input").forEach((input) => (input.value = ""));
            form.querySelectorAll("textarea").forEach((ta) => (ta.value = ""));
            form.querySelectorAll("input[type='file']").forEach((fi) => (fi.value = ""));
            form.style.display = "none";
        }
    },

    // Show a modal confirmation dialog with yes/no options
    showCancelConfirmation(formId, callback) {
        const modalHTML = `
      <div class="modal fade" id="cancelModal" tabindex="-1" aria-labelledby="cancelModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="cancelModalLabel">Aktion abbrechen</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
            </div>
            <div class="modal-body">
              Willst du die Aktion wirklich abbrechen? Alle Änderungen werden verworfen.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="cancelNoBtn">Nein</button>
              <button type="button" class="btn btn-danger" id="cancelYesBtn">Ja</button>
            </div>
          </div>
        </div>
      </div>
    `;
        const modalContainer = document.createElement("div");
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        const modalEl = modalContainer.querySelector(".modal");
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
        modalEl.querySelector("#cancelYesBtn").addEventListener("click", () => {
            callback(true);
            bsModal.hide();
        });
        modalEl.querySelector("#cancelNoBtn").addEventListener("click", () => {
            callback(false);
            bsModal.hide();
        });
        modalEl.addEventListener("hidden.bs.modal", () => {
            modalContainer.remove();
        });
    },

    // -------------- Shopping Creation & Editing --------------
    setupShoppingListeners() {
        const createShoppingBtn = document.getElementById("createShoppingBtn");
        const cancelShoppingBtn = document.getElementById("cancelShoppingBtn");

        // Handler for creating/updating a shopping entry
        createShoppingBtn.onclick = () => {
            const title = document.getElementById("shoppingTitle").value.trim();
            if (!title) {
                alert("Bitte einen Titel für den Einkauf eingeben!");
                return;
            }
            const selectedItems = Object.values(this.shoppingCart);
            if (this.currentEditingPurchaseId) {
                // If editing, pass an items array in newData
                todoModel.updatePurchase(this.currentEditingPurchaseId, { title, items: selectedItems });
                // Update the view completely:
                todoView.updatePurchase(this.currentEditingPurchaseId, { title, items: selectedItems });
                this.currentEditingPurchaseId = null;
                createShoppingBtn.textContent = "Einkauf erstellen";
            } else {
                const purchaseId = `purchase-${Date.now()}`;
                todoView.addShoppingItem(title, selectedItems, purchaseId);
                const purchase = { id: purchaseId, title, items: selectedItems };
                todoModel.addPurchase(purchase);
            }
            this.clearForm("shoppingForm");
            this.shoppingCart = {};
            document.getElementById("shoppingTagFilter").value = "";
            todoView.updateCart([]);
            this.loadAvailableItems();
        };

        // Handler for cancelling shopping entry
        cancelShoppingBtn.onclick = () => {
            this.showCancelConfirmation("shoppingForm", (confirmed) => {
                if (confirmed) {
                    this.clearForm("shoppingForm");
                    this.shoppingCart = {};
                    todoView.updateCart([]);
                    this.loadAvailableItems();
                    this.currentEditingPurchaseId = null;
                }
            });
        };

        // Delegated listener for edit button in the shopping accord
        document.getElementById("shoppingContainer").addEventListener("click", (event) => {
            if (event.target.classList.contains("edit-purchase-btn")) {
                const purchaseId = event.target.dataset.purchaseId;
                const purchaseObj = todoModel.getPurchases().find(p => p.id === purchaseId);
                if (purchaseObj) {
                    // Pre-fill the form with existing purchase data
                    document.getElementById("shoppingTitle").value = purchaseObj.title;
                    document.getElementById("shoppingTagFilter").value = "";
                    this.loadAvailableItems();
                    // Delay to ensure checkboxes are rendered
                    setTimeout(() => {
                        purchaseObj.items.forEach(item => {
                            const checkbox = document.querySelector(`#item-${item.id}`);
                            if (checkbox) {
                                checkbox.checked = true;
                                const quantityInput = document.getElementById(`quantity-${item.id}`);
                                if (quantityInput) {
                                    quantityInput.style.display = "block";
                                    quantityInput.value = item.quantity;
                                }
                                this.shoppingCart[item.id] = { ...item };
                            }
                        });
                        todoView.updateCart(Object.values(this.shoppingCart));
                    }, 100);
                    this.currentEditingPurchaseId = purchaseId;
                    createShoppingBtn.textContent = "Änderungen übernehmen";
                    document.getElementById("shoppingForm").style.display = "block";
                }
            }
        });

        // Load available items and tags for the shopping form
        this.loadAvailableItems();
        this.loadAvailableTags();
    },

    // Load items based on the selected tag filter
    loadAvailableItems() {
        const selectedTag = document.getElementById("shoppingTagFilter").value;
        const items = todoModel.getItems().filter((item) => !selectedTag || item.tag === selectedTag);
        todoView.renderItemSelection(items);
        this.restoreCartState();
        this.attachCartUpdateListeners();
        this.updateCart();
    },

    // Attach change listeners to checkboxes and number inputs within the item selection container
    attachCartUpdateListeners() {
        document.querySelectorAll("#itemSelectionContainer input[type='checkbox']").forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                const itemId = checkbox.dataset.itemId;
                if (checkbox.checked) {
                    const item = todoModel.getItems().find((i) => i.id === itemId);
                    const quantityInput = document.getElementById(`quantity-${itemId}`);
                    const quantity = quantityInput && quantityInput.value ? parseInt(quantityInput.value, 10) : 1;
                    this.shoppingCart[itemId] = { ...item, quantity };
                } else {
                    delete this.shoppingCart[itemId];
                }
                this.updateCart();
            });
        });
        document.querySelectorAll("#itemSelectionContainer input[type='number']").forEach((input) => {
            input.addEventListener("input", () => {
                const itemId = input.dataset.itemId;
                if (this.shoppingCart[itemId]) {
                    const quantity = input.value ? parseInt(input.value, 10) : 1;
                    this.shoppingCart[itemId].quantity = quantity;
                }
                this.updateCart();
            });
        });
    },

    // Restore the state of the item selection checkboxes based on the shopping cart
    restoreCartState() {
        document.querySelectorAll("#itemSelectionContainer input[type='checkbox']").forEach((checkbox) => {
            const itemId = checkbox.dataset.itemId;
            if (this.shoppingCart[itemId]) {
                checkbox.checked = true;
                const quantityInput = document.getElementById(`quantity-${itemId}`);
                if (quantityInput) {
                    quantityInput.style.display = "block";
                    quantityInput.value = this.shoppingCart[itemId].quantity;
                }
            }
        });
    },

    // Update the shopping cart view based on selected items
    updateCart() {
        const selectedItems = Object.values(this.shoppingCart);
        todoView.updateCart(selectedItems);
    },

    // -------------- Items (Articles) Creation & Editing --------------
    setupItemsListeners() {
        const createCardBtn = document.getElementById("createCardBtn");
        const cancelCardBtn = document.getElementById("cancelCardBtn");

        // Delegated listener for "Edit" button in item cards
        document.getElementById("cardContainer").addEventListener("click", (event) => {
            if (event.target.classList.contains("edit-article-btn")) {
                const itemId = event.target.dataset.itemId;
                const item = todoModel.getItems().find((i) => i.id === itemId);
                if (item) {
                    // Populate the card form with the item's data
                    document.getElementById("cardTitle").value = item.title;
                    document.getElementById("cardText").value = item.description;
                    document.getElementById("cardTag").value = item.tag;
                    this.currentEditingItemId = itemId;
                    createCardBtn.textContent = "Änderungen übernehmen";
                    document.getElementById("cardForm").style.display = "block";
                }
            }
        });

        createCardBtn.onclick = () => {
            const title = document.getElementById("cardTitle").value.trim();
            const description = document.getElementById("cardText").value.trim();
            const tag = document.getElementById("cardTag").value;
            const imageInput = document.getElementById("cardImage");
            const imageFile = imageInput.files[0];
            if (!title || !description) {
                alert("Bitte füllen Sie alle Felder aus!");
                return;
            }
            if (this.currentEditingItemId) {
                const updatedData = { id: this.currentEditingItemId, title, description, tag };
                const currentItem = todoModel.getItems().find((i) => i.id === this.currentEditingItemId);
                if (!currentItem) return;
                if (imageFile) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        updatedData.imageUrl = reader.result || "../img/Test.png";
                        todoModel.updateItem(this.currentEditingItemId, updatedData);
                        todoView.updateItemCard(updatedData);
                        todoView.updateArticleInPurchases(updatedData);
                        this.currentEditingItemId = null;
                        createCardBtn.textContent = "Karte erstellen";
                        this.clearForm("cardForm");
                    };
                    reader.readAsDataURL(imageFile);
                } else {
                    updatedData.imageUrl = currentItem.imageUrl;
                    todoModel.updateItem(this.currentEditingItemId, updatedData);
                    todoView.updateItemCard(updatedData);
                    todoView.updateArticleInPurchases(updatedData);
                    this.currentEditingItemId = null;
                    createCardBtn.textContent = "Karte erstellen";
                    this.clearForm("cardForm");
                }
            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    const imageUrl = reader.result || "../img/Test.png";
                    const newItem = { id: `item${Date.now()}`, title, description, tag, imageUrl };
                    todoModel.addItem(newItem);
                    todoView.addItemCard(newItem);
                    this.loadAvailableItems();
                    this.clearForm("cardForm");
                };
                if (imageFile) {
                    reader.readAsDataURL(imageFile);
                } else {
                    const newItem = { id: `item${Date.now()}`, title, description, tag, imageUrl: "../img/Test.png" };
                    todoModel.addItem(newItem);
                    todoView.addItemCard(newItem);
                    this.loadAvailableItems();
                    this.clearForm("cardForm");
                }
            }
        };

        cancelCardBtn.onclick = () => {
            this.showCancelConfirmation("cardForm", (confirmed) => {
                if (confirmed) {
                    this.clearForm("cardForm");
                    this.currentEditingItemId = null;
                    document.getElementById("createCardBtn").textContent = "Karte erstellen";
                }
            });
        };

        this.loadAvailableItems();
    },


// -------------- Tag Creation & Editing --------------
    setupTagsListeners() {
        // Get the create and cancel buttons for tag creation
        const createTagBtn = document.getElementById("createTagBtn");
        const cancelTagBtn = document.getElementById("cancelTagBtn");

        // On click for createTagBtn, create a new tag or update an existing one
        createTagBtn.onclick = () => {
            const title = document.getElementById("tagTitle").value.trim();
            if (!title) {
                alert("Bitte einen Titel eingeben!"); // Alert if no title is entered
                return;
            }
            if (this.currentEditingTag) {
                // If editing an existing tag, update it
                todoModel.updateTag(this.currentEditingTag, title);
                todoView.updateTag(this.currentEditingTag, title);
                this.currentEditingTag = null;
                createTagBtn.textContent = "Tag erstellen";
            } else {
                // Otherwise, add a new tag
                todoModel.addTag({ title });
                todoView.addTagToContainer(title);
            }
            // Render tag selection options and shopping tag filter
            todoView.renderTagSelection(todoModel.getTags());
            todoView.renderShoppingTagFilter(todoModel.getTags());
            // Clear the tag form
            this.clearForm("tagForm");
        };

        // On click for cancelTagBtn, show cancel confirmation and clear form if confirmed
        cancelTagBtn.onclick = () => {
            this.showCancelConfirmation("tagForm", (confirmed) => {
                if (confirmed) {
                    this.clearForm("tagForm");
                    this.currentEditingTag = null;
                }
            });
        };

        // Delegated listener for edit action in the tag section
        document.getElementById("tagContainer").addEventListener("click", (event) => {
            if (event.target.classList.contains("edit-tag-btn")) {
                const tagId = event.target.dataset.tagId;
                // Find the tag object matching the tagId (constructed from tag title)
                const tagObj = todoModel.getTags().find(t => `tag-${t.title.replace(/\s/g, "-")}` === tagId);
                if (tagObj) {
                    // Populate the tag form with the tag's title and set edit mode
                    document.getElementById("tagTitle").value = tagObj.title;
                    this.currentEditingTag = tagObj.title;
                    createTagBtn.textContent = "Änderungen übernehmen";
                    document.getElementById("tagForm").style.display = "block";
                }
            }
        });
    },

// -------------- List Creation & Editing --------------
    setupListListeners() {
        // Render purchase selection options for lists
        todoView.renderPurchaseSelectionForList(todoModel.getPurchases());
        const createListBtn = document.getElementById("createListBtn");
        const cancelListBtn = document.getElementById("cancelListBtn");

        // On click for createListBtn, create a new list or update an existing list
        createListBtn.onclick = () => {
            const title = document.getElementById("listTitle").value.trim();
            if (!title) {
                alert("Bitte einen Titel für die Liste eingeben!"); // Alert if no title is entered
                return;
            }
            const selectedPurchaseIds = [];
            // Gather selected purchase IDs from the purchase selection container
            document.querySelectorAll("#purchaseSelectionContainer input.purchase-select:checked")
                .forEach((checkbox) => selectedPurchaseIds.push(checkbox.dataset.purchaseId));
            const allPurchases = todoModel.getPurchases();
            // Filter purchases based on selected IDs
            const selectedPurchases = allPurchases.filter((p) => selectedPurchaseIds.includes(p.id));
            if (this.currentEditingListId) {
                // Update the list in the model
                todoModel.updateList(this.currentEditingListId, { title, purchases: selectedPurchases });
                // Update the list in the view (pass both title and purchase list)
                todoView.updateList(this.currentEditingListId, { title, purchases: selectedPurchases });
                this.currentEditingListId = null;
                createListBtn.textContent = "Liste erstellen";
            } else {
                // Create a new list with a generated ID
                const listId = `list-${Date.now()}`;
                todoView.addListToContainer(title, selectedPurchases);
                todoModel.addList({ id: listId, title, purchases: selectedPurchases });
            }
            // Clear the list form and reset purchase selections
            this.clearForm("listForm");
            document.getElementById("purchaseSelectionContainer").innerHTML = "";
            document.getElementById("listPurchasesContainer").innerHTML = "<p>Keine Einkäufe ausgewählt.</p>";
        };

        // On click for cancelListBtn, show cancel confirmation and clear the form if confirmed
        cancelListBtn.onclick = () => {
            this.showCancelConfirmation("listForm", (confirmed) => {
                if (confirmed) {
                    this.clearForm("listForm");
                    document.getElementById("purchaseSelectionContainer").innerHTML = "";
                    document.getElementById("listPurchasesContainer").innerHTML = "<p>Keine Einkäufe ausgewählt.</p>";
                    this.currentEditingListId = null;
                }
            });
        };

        // Delegated listener for edit action in the list section
        document.getElementById("listContainer").addEventListener("click", (event) => {
            if (event.target.classList.contains("edit-list-btn")) {
                const listId = event.target.dataset.listId;
                const listObj = todoModel.getLists().find(l => l.id === listId);
                if (listObj) {
                    // Populate the list form with existing list data
                    document.getElementById("listTitle").value = listObj.title;
                    todoView.renderPurchaseSelectionForList(todoModel.getPurchases());
                    // Check the purchases that are part of this list
                    listObj.purchases.forEach(purchase => {
                        const checkbox = document.getElementById(`purchase-select-${purchase.id}`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                    // Update the view with selected purchase IDs
                    const selectedIds = listObj.purchases.map(p => p.id);
                    todoView.updateListPurchases(selectedIds, todoModel.getPurchases());
                    this.currentEditingListId = listId;
                    createListBtn.textContent = "Änderungen übernehmen";
                    document.getElementById("listForm").style.display = "block";
                }
            }
        });
    },

// -------------- Friend Creation & Editing --------------
    setupFriendsListeners() {
        // Get create and cancel buttons for friend creation
        const createFriendBtn = document.getElementById("createFriendBtn");
        const cancelFriendBtn = document.getElementById("cancelFriendBtn");

        // On click for createFriendBtn, create a new friend or update an existing friend
        createFriendBtn.onclick = () => {
            const firstName = document.getElementById("friendFirstName").value.trim();
            const lastName = document.getElementById("friendLastName").value.trim();
            const email = document.getElementById("friendEmail").value.trim();
            if (!firstName || !lastName || !email || !this.validateEmail(email)) {
                alert("Bitte geben Sie gültige Daten ein!");
                return;
            }
            if (this.currentEditingFriendId) {
                // If editing an existing friend, update their data
                todoModel.updateFriend(this.currentEditingFriendId, { firstName, lastName, email });
                todoView.updateFriend(this.currentEditingFriendId, { firstName, lastName, email });
                this.currentEditingFriendId = null;
                createFriendBtn.textContent = "Freund hinzufügen";
            } else {
                // Create a new friend with a generated ID based on their email
                const friendId = `friend-${email.replace(/[@.]/g, "-")}`;
                todoView.addFriendToContainer(firstName, lastName, email);
                todoModel.addFriend({ id: friendId, firstName, lastName, email });
            }
            // Clear the friend form
            this.clearForm("friendsForm");
        };

        // On click for cancelFriendBtn, show cancel confirmation and clear the form if confirmed
        cancelFriendBtn.onclick = () => {
            this.showCancelConfirmation("friendsForm", (confirmed) => {
                if (confirmed) {
                    this.clearForm("friendsForm");
                    this.currentEditingFriendId = null;
                }
            });
        };

        // Delegated listener for edit action in the friend section
        document.getElementById("friendsContainer").addEventListener("click", (event) => {
            if (event.target.classList.contains("edit-friend-btn")) {
                const friendId = event.target.dataset.friendId;
                const friendData = todoModel.getFriendById(friendId);
                if (friendData) {
                    // Populate the friend form with existing friend data
                    document.getElementById("friendFirstName").value = friendData.firstName;
                    document.getElementById("friendLastName").value = friendData.lastName;
                    document.getElementById("friendEmail").value = friendData.email;
                    this.currentEditingFriendId = friendId;
                    createFriendBtn.textContent = "Änderungen übernehmen";
                    document.getElementById("friendsForm").style.display = "block";
                }
            }
        });
    },

// Validate email format using a regular expression
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    setupEditListeners() {
    },

// loadAvailableTags, update the tag filter in shopping section
    loadAvailableTags() {
        todoView.renderShoppingTagFilter(todoModel.getTags());
    }
};

export { todoController };