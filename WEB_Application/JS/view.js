import { todoModel } from "./model.js";

// Define the view object that handles all UI updates
const todoView = {
    // Update visible section based on activeSection
    update(activeSection) {
        document.querySelectorAll("main").forEach((main) => {
            // Display the main element if it contains the active section's class; hide otherwise
            main.style.display = main.classList.contains(activeSection) ? "block" : "none";
        });
    },

    // Utility function to hide a form by its ID
    hideForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.style.display = "none";
        }
    },

    // ---------------- FRIENDS ----------------
    // Adds a new friend entry to the friends container
    addFriendToContainer(firstName, lastName, email) {
        const container = document.getElementById("friendsContainer");
        // Generate a unique ID based on the email address
        const friendId = `friend-${email.replace(/[@.]/g, "-")}`;
        const friendHTML = `
      <div id="${friendId}">
        ${firstName} ${lastName} - ${email}
        <button class="btn btn-link edit-friend-btn" data-friend-id="${friendId}" style="text-decoration: underline; color: #ff5d15;">Bearbeiten</button>
        <button class="btn btn-link delete-friend-btn" data-friend-id="${friendId}" style="text-decoration: underline; color: #ff5d15;">Löschen</button>
        <hr>
      </div>
    `;
        container.insertAdjacentHTML("beforeend", friendHTML);
    },

    // Updates an existing friend entry in the DOM
    updateFriend(friendId, { firstName, lastName, email }) {
        const friendEl = document.getElementById(friendId);
        if (friendEl) {
            friendEl.innerHTML = `
        ${firstName} ${lastName} - ${email}
        <button class="btn btn-link edit-friend-btn" data-friend-id="${friendId}" style="text-decoration: underline; color: #ff5d15;">Bearbeiten</button>
        <button class="btn btn-link delete-friend-btn" data-friend-id="${friendId}" style="text-decoration: underline; color: #ff5d15;">Löschen</button>
        <hr>
      `;
        }
    },

    // ---------------- TAGS ----------------
    // Adds a new tag to the tag container
    addTagToContainer(tagTitle) {
        const container = document.getElementById("tagContainer");
        const tagId = `tag-${tagTitle.replace(/\s/g, "-")}`;
        const tagHTML = `
      <div id="${tagId}">
        ${tagTitle}
        <button class="btn btn-link edit-tag-btn" data-tag-id="${tagId}" style="text-decoration: underline; color: #ff5d15;">Bearbeiten</button>
        <button class="btn btn-link delete-tag-btn" data-tag-id="${tagId}" style="text-decoration: underline; color: #ff5d15;">Löschen</button>
        <hr>
      </div>
    `;
        container.insertAdjacentHTML("beforeend", tagHTML);
        // Do not remove any event listeners here – deletion is handled by a centralized delegation in the view.
    },

    // Updates an existing tag in the DOM and updates badges using the old tag title
    updateTag(oldTagTitle, newTagTitle) {
        const oldTagId = `tag-${oldTagTitle.replace(/\s/g, "-")}`;
        const tagEl = document.getElementById(oldTagId);
        if (tagEl) {
            tagEl.innerHTML = `
        ${newTagTitle}
        <button class="btn btn-link edit-tag-btn" data-tag-id="tag-${newTagTitle.replace(/\s/g, "-")}" style="text-decoration: underline; color: #ff5d15;">Bearbeiten</button>
        <button class="btn btn-link delete-tag-btn" data-tag-id="tag-${newTagTitle.replace(/\s/g, "-")}" style="text-decoration: underline; color: #ff5d15;">Löschen</button>
        <hr>
      `;
            tagEl.id = `tag-${newTagTitle.replace(/\s/g, "-")}`;
        }
        // Update all article badges that display the old tag
        document.querySelectorAll(".badge.bg-primary").forEach((badge) => {
            if (badge.innerText === oldTagTitle) {
                badge.innerText = newTagTitle;
            }
        });
    },

    // Renders the tag selection options in the card tag dropdown
    renderTagSelection(tags) {
        const container = document.getElementById("cardTag");
        container.innerHTML = "";
        tags.forEach((tag) => {
            const tagHTML = `<option value="${tag.title}">${tag.title}</option>`;
            container.insertAdjacentHTML("beforeend", tagHTML);
        });
    },

    // ---------------- ITEMS ----------------
    // Adds a new article card to the card container
    addItemCard(itemData) {
        const container = document.getElementById("cardContainer");
        const cardHTML = `
    <div class="col-xxl-3 col-xl-4 col-lg-6 col-md-6 mb-4" id="card-${itemData.id}">
      <div class="card" style="height: 23rem;">
        <img class="card-img-top" src="${itemData.imageUrl}" alt="Card image">
        <div class="card-body">
          <h5 class="card-title">${itemData.title}</h5>
          <p class="card-text">${itemData.description}</p>
          <span class="badge bg-primary">${itemData.tag}</span>
          <br>
          <div class="art-container">
            <button class="btn btn-link edit-article-btn" data-item-id="${itemData.id}" style="text-decoration: underline; color: #ff5d15;">Bearbeiten</button>
            <button class="btn btn-link delete-article-btn" data-item-id="${itemData.id}" style="text-decoration: underline; color: #ff5d15;">Löschen</button>
          </div>
         </div>
      </div>
    </div>
  `;
        container.insertAdjacentHTML("beforeend", cardHTML);
    },

    // Updates an existing article card in the DOM with new data
    updateItemCard(itemData) {
        const cardEl = document.getElementById(`card-${itemData.id}`);
        if (cardEl) {
            cardEl.innerHTML = `
        <div class="card" style="height: 23rem;">
          <img class="card-img-top" src="${itemData.imageUrl}" alt="Card image">
          <div class="card-body">
            <h5 class="card-title">${itemData.title}</h5>
            <p class="card-text">${itemData.description}</p>
            <span class="badge bg-primary">${itemData.tag}</span>
            <br>
            <button class="btn btn-link edit-article-btn" data-item-id="${itemData.id}" style="text-decoration: underline; color: #ff5d15;">Bearbeiten</button>
            <button class="btn btn-link delete-article-btn" data-item-id="${itemData.id}" style="text-decoration: underline; color: #ff5d15;">Löschen</button>
          </div>
        </div>
      `;
        }
    },

    // Updates the article title and quantity in all shopping items referencing this article
    updateArticleInPurchases(updatedArticle) {
        const elements = document.querySelectorAll(`.shopping-item[data-item-id="${updatedArticle.id}"]`);
        elements.forEach((el) => {
            const label = el.querySelector("label.item-label");
            if (label) {
                const match = label.innerText.match(/\((\d+)x\)/);
                const quantity = match ? match[1] : "1";
                label.innerText = `${updatedArticle.title} (${quantity}x)`;
            }
        });
    },

    // Renders the item selection list (checkboxes and quantity inputs) dynamically
    renderItemSelection(items) {
        const container = document.getElementById("itemSelectionContainer");
        container.innerHTML = "";
        items.forEach((item) => {
            const itemHTML = `
        <div class="d-flex align-items-center mb-2">
          <input type="checkbox" class="form-check-input item-checkbox me-2" id="item-${item.id}" data-item-id="${item.id}">
          <label class="form-check-label me-3" for="item-${item.id}">${item.title}</label>
          <input type="number" class="form-control item-quantity" id="quantity-${item.id}" data-item-id="${item.id}" placeholder="Menge" min="1" style="width: 80px; display: none;">
        </div>
      `;
            container.insertAdjacentHTML("beforeend", itemHTML);
        });
        // Add event listeners to toggle the quantity input when a checkbox is changed
        document.querySelectorAll(".item-checkbox").forEach((checkbox) => {
            checkbox.addEventListener("change", function () {
                const itemId = this.dataset.itemId;
                const quantityInput = document.getElementById(`quantity-${itemId}`);
                quantityInput.style.display = this.checked ? "block" : "none";
            });
        });
    },

    // ---------------- SHOPPING ----------------
    // Adds a new shopping entry (purchase) as an accordion item
    addShoppingItem(title, itemsWithQuantity, purchaseId) {
        const container = document.getElementById("shoppingContainer");
        const groupedItems = {};
        // Group items by tag
        itemsWithQuantity.forEach((item) => {
            if (!groupedItems[item.tag]) {
                groupedItems[item.tag] = [];
            }
            groupedItems[item.tag].push(item);
        });
        let itemsHTML = "";
        // Build HTML for each group of items
        for (const tag in groupedItems) {
            const groupItems = groupedItems[tag];
            const listItems = groupItems.map((item) => `
        <li class="shopping-item" data-item-id="${item.id}">
          <input type="checkbox" class="item-toggle" id="toggle-${item.id}">
          <label class="item-label" for="toggle-${item.id}">${item.title} (${item.quantity}x)</label>
        </li>
      `).join("");
            itemsHTML += `<strong>${tag}</strong><ul>${listItems}</ul>`;
        }
        const shoppingHTML = `
      <div class="accordion-item" data-purchase-id="${purchaseId}">
        <h2 class="accordion-header d-flex justify-content-between align-items-center" id="heading-${purchaseId}">
          <div class="d-flex align-items-center flex-grow-1">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${purchaseId}" aria-expanded="false" aria-controls="collapse-${purchaseId}">
              ${title}
              <i class="bi bi-chevron-right accordion-icon ms-auto"></i>
            </button>
            <button class="btn btn-link edit-purchase-btn" data-purchase-id="${purchaseId}" style="text-decoration: underline; color: #ff5d15;">Bearbeiten</button>
          </div>
          <div class="d-flex align-items-center">
            <input type="checkbox" class="purchase-checkbox ms-2" id="purchase-${purchaseId}" disabled>
            <button class="btn btn-danger btn-sm delete-purchase-btn ms-2" style="display: none;">Einkauf löschen</button>
          </div>
        </h2>
        <div id="collapse-${purchaseId}" class="accordion-collapse collapse" aria-labelledby="heading-${purchaseId}" data-bs-parent="#shoppingContainer">
          <div class="accordion-body">
            ${itemsHTML}
          </div>
        </div>
      </div>
    `;
        container.insertAdjacentHTML("beforeend", shoppingHTML);
        const accordionItem = container.lastElementChild;
        const purchaseCheckbox = accordionItem.querySelector(".purchase-checkbox");
        const deleteBtn = accordionItem.querySelector(".delete-purchase-btn");

        // Function to update the purchase checkbox based on the state of item toggles
        const updatePurchaseCheckbox = () => {
            const articleToggles = accordionItem.querySelectorAll(".item-toggle");
            let allChecked = articleToggles.length > 0;
            articleToggles.forEach((toggle) => {
                if (!toggle.checked) {
                    allChecked = false;
                }
            });
            if (allChecked) {
                purchaseCheckbox.disabled = false;
            } else {
                purchaseCheckbox.disabled = true;
                purchaseCheckbox.checked = false;
                const button = accordionItem.querySelector(".accordion-button");
                button.style.textDecoration = "none";
                button.style.color = "";
                // Move the delete button back to the right container and hide it
                const rightContainer = accordionItem.querySelector(".d-flex.align-items-center:not(.flex-grow-1)");
                if (deleteBtn.parentElement !== rightContainer) {
                    deleteBtn.remove();
                    rightContainer.appendChild(deleteBtn);
                }
                deleteBtn.style.display = "none";
            }
        };

        // Listener for the purchase checkbox: when checked, move the delete button to the left container
        purchaseCheckbox.addEventListener("change", function () {
            const button = accordionItem.querySelector(".accordion-button");
            if (purchaseCheckbox.checked) {
                // Mark the header as crossed out
                button.style.textDecoration = "line-through";
                button.style.color = "#777";
                // Move the delete button to the left container (next to the edit button)
                const leftContainer = accordionItem.querySelector(".d-flex.align-items-center.flex-grow-1");
                if (deleteBtn.parentElement !== leftContainer) {
                    deleteBtn.remove();
                    leftContainer.appendChild(deleteBtn);
                }
                // Style the delete button as a btn-link (orange, underlined)
                deleteBtn.classList.remove("btn-danger", "btn-sm");
                deleteBtn.classList.add("btn", "btn-link", "delete-purchase-btn");
                deleteBtn.style.display = "inline-block";
            } else {
                // Reset the header style
                button.style.textDecoration = "none";
                button.style.color = "";
                // Move the delete button back to the right container and hide it
                const rightContainer = accordionItem.querySelector(".d-flex.align-items-center:not(.flex-grow-1)");
                if (deleteBtn.parentElement !== rightContainer) {
                    deleteBtn.remove();
                    rightContainer.appendChild(deleteBtn);
                }
                deleteBtn.style.display = "none";
            }
        });

        // Add change listeners for each item toggle in the purchase accordion
        const articleToggles = accordionItem.querySelectorAll(".item-toggle");
        articleToggles.forEach((toggle) => {
            toggle.addEventListener("change", function () {
                const label = accordionItem.querySelector(`label[for="${toggle.id}"]`);
                if (toggle.checked) {
                    label.style.textDecoration = "line-through";
                    label.style.color = "#777";
                } else {
                    label.style.textDecoration = "none";
                    label.style.color = "";
                }
                updatePurchaseCheckbox();
            });
        });
        // Also update header style based on purchase checkbox changes
        purchaseCheckbox.addEventListener("change", function () {
            const button = accordionItem.querySelector(".accordion-button");
            if (purchaseCheckbox.checked) {
                button.style.textDecoration = "line-through";
                button.style.color = "#777";
                deleteBtn.style.display = "inline-block";
            } else {
                button.style.textDecoration = "none";
                button.style.color = "";
                deleteBtn.style.display = "none";
            }
        });
        // Add a click listener to the delete button to show confirmation and then delete the purchase
        deleteBtn.addEventListener("click", function () {
            todoView.showDeleteConfirmation(accordionItem, () => {
                todoModel.deletePurchase(purchaseId); // Remove purchase from the model
                accordionItem.remove();               // Remove the DOM element
                todoView.removePurchaseFromSelection(purchaseId);
            });
        });
    },

    // Updates an existing purchase entry in the DOM with new data
    updatePurchase(purchaseId, newData) {
        const accordionItem = document.querySelector(`.accordion-item[data-purchase-id="${purchaseId}"]`);
        if (accordionItem) {
            const headerButton = accordionItem.querySelector(".accordion-button");
            // Update the title in the header
            headerButton.innerHTML = `
      ${newData.title}
      <i class="bi bi-chevron-right accordion-icon ms-auto"></i>
    `;
            // If new item data is provided, group items by tag and render them
            if (newData.items) {
                // Group articles by tag
                let groupedItems = {};
                newData.items.forEach((item) => {
                    if (!groupedItems[item.tag]) {
                        groupedItems[item.tag] = [];
                    }
                    groupedItems[item.tag].push(item);
                });
                let itemsHTML = "";
                for (const tag in groupedItems) {
                    const groupItems = groupedItems[tag];
                    const listItems = groupItems
                        .map((item) => `
            <li class="shopping-item" data-item-id="${item.id}">
              <input type="checkbox" class="item-toggle" id="toggle-${item.id}">
              <label class="item-label" for="toggle-${item.id}">${item.title} (${item.quantity}x)</label>
            </li>
          `)
                        .join("");
                    itemsHTML += `<strong>${tag}</strong><ul>${listItems}</ul>`;
                }
                // Update the accordion body with the new items HTML
                const accordionBody = accordionItem.querySelector(".accordion-body");
                if (accordionBody) {
                    accordionBody.innerHTML = itemsHTML;
                }
            }
        }
    },

    // Removes a purchase from the selection (e.g., from a checkbox container)
    removePurchaseFromSelection(purchaseId) {
        const checkbox = document.getElementById(`purchase-select-${purchaseId}`);
        if (checkbox && checkbox.parentElement) {
            checkbox.parentElement.remove();
        }
    },

    // Central delete confirmation modal – deletion is only handled via the callback
    showDeleteConfirmation(affectedElement, onConfirm) {
        // Remove any existing modal elements
        const existingModal = document.getElementById("deleteModal");
        if (existingModal) {
            existingModal.parentElement.remove();
        }
        const modalHTML = `
      <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="deleteModalLabel">Löschen bestätigen</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
                  </div>
                  <div class="modal-body">
                      Wenn du auf bestätigen klickst, wird das Element unwiderruflich gelöscht.
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" id="cancelDelete">Nein</button>
                      <button type="button" class="btn btn-danger" id="confirmDelete">Ja</button>
                  </div>
              </div>
          </div>
      </div>
    `;
        const modalContainer = document.createElement("div");
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        const modalElement = modalContainer.querySelector(".modal");
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();
        modalElement.querySelector("#cancelDelete").addEventListener("click", () => {
            bsModal.hide();
        });
        modalElement.querySelector("#confirmDelete").addEventListener("click", () => {
            onConfirm();
            bsModal.hide();
            // Do not directly remove affectedElement here to avoid duplicate removal.
        });
        modalElement.addEventListener("hidden.bs.modal", () => {
            modalContainer.remove();
        });
    },

    // Renders the shopping tag filter dropdown with available tags
    renderShoppingTagFilter(tags) {
        const dropdown = document.getElementById("shoppingTagFilter");
        dropdown.innerHTML = `<option value="">Alle Tags</option>`;
        tags.forEach((tag) => {
            const tagOption = `<option value="${tag.title}">${tag.title}</option>`;
            dropdown.insertAdjacentHTML("beforeend", tagOption);
        });
    },

    // Updates the shopping cart view based on selected items
    updateCart(selectedItems) {
        const cartContainer = document.getElementById("shoppingCartContainer");
        cartContainer.innerHTML = "";
        if (selectedItems.length === 0) {
            cartContainer.innerHTML = "<p>Der Korb ist leer.</p>";
            return;
        }
        selectedItems.forEach((item) => {
            const cartItemHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span>${item.title} (${item.quantity}x)</span>
          <button class="btn btn-danger btn-sm remove-from-cart" data-item-id="${item.id}">Entfernen</button>
        </div>
      `;
            cartContainer.insertAdjacentHTML("beforeend", cartItemHTML);
        });
        // Add click listeners to each remove button to update the cart
        document.querySelectorAll(".remove-from-cart").forEach((btn) => {
            btn.addEventListener("click", function () {
                const itemId = this.dataset.itemId;
                const checkbox = document.querySelector(`#item-${itemId}`);
                const quantityInput = document.querySelector(`#quantity-${itemId}`);
                if (checkbox) {
                    checkbox.checked = false;
                }
                if (quantityInput) {
                    quantityInput.style.display = "none";
                }
                const updatedItems = selectedItems.filter((item) => item.id !== itemId);
                todoView.updateCart(updatedItems);
            });
        });
    },

// ---------------- LISTEN ----------------
    renderPurchaseSelectionForList(purchases) {
        const container = document.getElementById("purchaseSelectionContainer");
        container.innerHTML = ""; // Clear the container before rendering new purchases
        purchases.forEach((purchase) => {
            const purchaseHTML = `
        <div class="form-check">
          <input class="form-check-input purchase-select" type="checkbox" id="purchase-select-${purchase.id}" data-purchase-id="${purchase.id}">
          <label class="form-check-label" for="purchase-select-${purchase.id}">${purchase.title}</label>
        </div>
      `;
            container.insertAdjacentHTML("beforeend", purchaseHTML); // Append each purchase selection option
        });
    },

    updateListPurchases(selectedPurchaseIds, allPurchases) {
        const container = document.getElementById("listPurchasesContainer");
        const selectedPurchases = allPurchases.filter((p) => selectedPurchaseIds.includes(p.id));
        if (selectedPurchases.length === 0) {
            container.innerHTML = "<p>Keine Einkäufe ausgewählt.</p>"; // Display message if no purchases are selected
            return;
        }
        let html = "<ul>";
        selectedPurchases.forEach((purchase) => {
            html += `<li>${purchase.title}</li>`; // List each selected purchase
        });
        html += "</ul>";
        container.innerHTML = html; // Update the list container
    },

    addListToContainer(listTitle, selectedPurchases, listId) {
        const container = document.getElementById("listContainer");
        let purchasesHTML = "";
        selectedPurchases.forEach((purchase) => {
            purchasesHTML += `<li>${purchase.title}</li>`; // Generate list items for selected purchases
        });

        // Use the provided list ID or generate a new one
        const id = listId ? listId : `list-${Date.now()}`;
        const allDone = selectedPurchases.length > 0 && selectedPurchases.every(p => p.checked);

        const listHTML = `
    <div class="accordion-item" id="${id}">
      <h2 class="accordion-header d-flex justify-content-between align-items-center" id="heading-${id}">
        <div class="d-flex align-items-center flex-grow-1">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${id}" aria-expanded="false" aria-controls="collapse-${id}">
            ${listTitle}
            <i class="bi bi-chevron-right accordion-icon ms-auto"></i>
          </button>
          <button class="btn btn-link edit-list-btn" data-list-id="${id}" style="text-decoration: underline; color: #ff5d15;">Bearbeiten</button>
        </div>
        <div class="d-flex align-items-center">
          <input type="checkbox" class="list-done-checkbox me-2" id="list-done-${id}" ${allDone ? "" : "disabled"}>
          <button class="btn btn-danger btn-sm delete-list-btn" data-list-id="${id}" style="display: none;">Löschen</button>
        </div>
      </h2>
      <div id="collapse-${id}" class="accordion-collapse collapse" aria-labelledby="heading-${id}" data-bs-parent="#listContainer">
        <div class="accordion-body">
          <ul>${purchasesHTML}</ul>
        </div>
      </div>
    </div>
  `;
        container.insertAdjacentHTML("beforeend", listHTML); // Add the new list to the container
        this.setupListDoneBehavior(id); // Set up behavior for marking the list as done
    },

    // Updates an existing list in the UI
    updateList(listId, newData) {
        const accordionItem = document.getElementById(listId);
        if (accordionItem) {
            // Update the header title
            const headerButton = accordionItem.querySelector(".accordion-button");
            headerButton.innerHTML = `
      ${newData.title}
      <i class="bi bi-chevron-right accordion-icon ms-auto"></i>
    `;
            // Update the list items if purchases are provided
            if (newData.purchases) {
                let purchasesHTML = "";
                newData.purchases.forEach((purchase) => {
                    purchasesHTML += `<li>${purchase.title}</li>`;
                });
                const ulContainer = accordionItem.querySelector(".accordion-body ul");
                if (ulContainer) {
                    ulContainer.innerHTML = purchasesHTML;
                }
            }
        }
    },

    // Sets up the behavior for when a list is marked as done
    setupListDoneBehavior(listId) {
        const listItem = document.getElementById(listId);
        if (listItem) {
            const doneCheckbox = listItem.querySelector(".list-done-checkbox");
            const deleteBtn = listItem.querySelector(".delete-list-btn");
            const headerButton = listItem.querySelector(".accordion-button");

            // Handle checkbox change event
            doneCheckbox.addEventListener("change", () => {
                if (doneCheckbox.checked) {
                    headerButton.style.textDecoration = "line-through";
                    headerButton.style.color = "#777";
                    const leftContainer = listItem.querySelector(".d-flex.align-items-center.flex-grow-1");
                    if (deleteBtn.parentElement !== leftContainer) {
                        deleteBtn.remove();
                        leftContainer.appendChild(deleteBtn);
                    }
                    deleteBtn.classList.remove("btn-danger", "btn-sm");
                    deleteBtn.classList.add("btn", "btn-link", "delete-list-btn");
                    deleteBtn.style.display = "inline-block";
                } else {
                    headerButton.style.textDecoration = "none";
                    headerButton.style.color = "";
                    const rightContainer = listItem.querySelector(".d-flex.align-items-center:not(.flex-grow-1)");
                    if (deleteBtn.parentElement !== rightContainer) {
                        deleteBtn.remove();
                        rightContainer.appendChild(deleteBtn);
                    }
                    deleteBtn.style.display = "none";
                }
            });

            deleteBtn.addEventListener("click", () => {
                this.showDeleteConfirmation(listItem, () => {
                    listItem.remove();
                });
            });

            doneCheckbox.disabled = false;
        }
    },
};

export {todoView};
// Centralized, one-time delegation for delete buttons – these listeners are registered only once when the DOM is loaded.
document.addEventListener("DOMContentLoaded", () => {
    const tagContainer = document.getElementById("tagContainer");

    // Check if the tag container exists
    if (tagContainer) {
        // Add a click event listener to handle tag deletion
        tagContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("delete-tag-btn")) {
                const tagId = event.target.dataset.tagId;
                const tagTitle = event.target.parentNode.textContent.trim().split(" ")[0];

                // Show delete confirmation before removing the tag
                todoView.showDeleteConfirmation(document.getElementById(tagId), () => {
                    todoModel.deleteTag(tagTitle); // Remove the tag from the model
                    document.getElementById(tagId).remove(); // Remove the tag from the DOM
                });
            }
        });
    }

    // Add a click event listener to handle article deletion inside the card container
    document.getElementById("cardContainer").addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-article-btn")) {
            const itemId = event.target.dataset.itemId;

            // Check if the article is still used in any purchase
            if (todoModel.isItemUsedInPurchases(itemId)) {
                alert("The item is still used in a purchase and cannot be deleted.");
                return; // Stop execution if the item is still in use
            }

            // If the item is not used in any purchase, proceed with the deletion confirmation
            todoView.showDeleteConfirmation(document.getElementById(`card-${itemId}`), () => {
                todoModel.deleteItem(itemId); // Remove the item from the model
                document.getElementById(`card-${itemId}`).remove(); // Remove the item from the DOM
            });
        }
    });

    const friendsContainer = document.getElementById("friendsContainer");

    // Check if the friends container exists
    if (friendsContainer) {
        // Add a click event listener to handle friend deletion
        friendsContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("delete-friend-btn")) {
                const friendId = event.target.dataset.friendId;

                // Show delete confirmation before removing the friend
                todoView.showDeleteConfirmation(document.getElementById(friendId), () => {
                    todoModel.deleteFriend(friendId); // Remove the friend from the model
                    document.getElementById(friendId).remove(); // Remove the friend from the DOM
                });
            }
        });
    }
});
