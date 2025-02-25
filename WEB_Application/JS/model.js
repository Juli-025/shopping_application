// model.js
const todoModel = {
    // Active section (e.g., "shopping")
    activeSection: "shopping",
    // Arrays to store items, tags, purchases, friends, and lists
    items: [],
    tags: [],
    purchases: [],
    friends: [],
    lists: [],

    // Set the active section
    setActiveSection(section) {
        this.activeSection = section;
    },
    // Get the active section
    getActiveSection() {
        return this.activeSection;
    },

    // ITEMS
    // Add a new item
    addItem(item) {
        this.items.push(item);
    },
    // Retrieve all items
    getItems() {
        return this.items;
    },
    // Update an item with new data
    updateItem(itemId, newData) {
        const index = this.items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...newData };
            // If the item belongs to a purchase, update that purchase's status
            this.updatePurchaseStatus(this.items[index].purchaseId);
        }
    },
    // Delete an item by its ID
    deleteItem(itemId) {
        this.items = this.items.filter((item) => item.id !== itemId);
    },
    // Check if an item is used in any purchase
    isItemUsedInPurchases(itemId) {
        return this.purchases.some(purchase =>
            purchase.items && purchase.items.some(item => item.id === itemId)
        );
    },

    // TAGS
    // Add a new tag if it doesn't already exist
    addTag(tag) {
        if (!this.tags.some((t) => t.title === tag.title)) {
            this.tags.push(tag);
        }
    },
    // Retrieve all tags
    getTags() {
        return this.tags;
    },
    // Update a tag's title
    updateTag(oldTagTitle, newTagTitle) {
        const tag = this.tags.find((t) => t.title === oldTagTitle);
        if (tag) {
            tag.title = newTagTitle;
        }
    },
    // Delete a tag if no item is using it; returns false if deletion is prevented, true otherwise
    deleteTag(tagTitle) {
        const items = this.getItems().filter((item) => item.tag === tagTitle);
        if (items.length > 0) {
            alert("The tag can only be deleted if no item uses it. Please ensure the tag is not in use.");
            return false; // Prevent deletion
        } else {
            this.tags = this.tags.filter((tag) => tag.title !== tagTitle);
            return true; // Confirm deletion
        }
    },

    // PURCHASES
    // Add a new purchase; default 'checked' status is false
    addPurchase(purchase) {
        this.purchases.push({ ...purchase, checked: false });
    },
    // Retrieve all purchases
    getPurchases() {
        return this.purchases;
    },
    // Update a purchase with new data and update the associated list's status
    updatePurchase(purchaseId, newData) {
        const index = this.purchases.findIndex((p) => p.id === purchaseId);
        if (index !== -1) {
            this.purchases[index] = { ...this.purchases[index], ...newData };
            // Also update the status of the associated list
            this.updateListStatus(this.purchases[index].listId);
        }
    },
    // Delete a purchase by its ID and update any associated lists by removing this purchase
    deletePurchase(purchaseId) {
        // Remove the purchase from the array
        this.purchases = this.purchases.filter((p) => p.id !== purchaseId);
        // For each list, remove the deleted purchase and update the list status
        this.lists.forEach(list => {
            if (list.purchases) {
                list.purchases = list.purchases.filter(p => p.id !== purchaseId);
                this.updateListStatus(list.id);
            }
        });
    },
    // Update a purchase's status based on its related items; also update associated list status
    updatePurchaseStatus(purchaseId) {
        const purchase = this.purchases.find((p) => p.id === purchaseId);
        if (purchase) {
            const relatedItems = this.items.filter((item) => item.purchaseId === purchaseId);
            purchase.checked = relatedItems.length > 0 && relatedItems.every((item) => item.checked);
            // Also update the status of the associated list
            this.updateListStatus(purchase.listId);
        }
    },

    // FRIENDS
    // Add a new friend
    addFriend(friend) {
        this.friends.push(friend);
    },
    // Get a friend by ID
    getFriendById(friendId) {
        return this.friends.find((f) => f.id === friendId);
    },
    // Update a friend's information
    updateFriend(friendId, newData) {
        const index = this.friends.findIndex((f) => f.id === friendId);
        if (index !== -1) {
            this.friends[index] = { ...this.friends[index], ...newData };
        }
    },
    // Delete a friend by ID
    deleteFriend(friendId) {
        this.friends = this.friends.filter((f) => f.id !== friendId);
    },

    // LISTS
    // Add a new list; default 'checked' status is false
    addList(list) {
        this.lists.push({ ...list, checked: false });
    },
    // Retrieve all lists
    getLists() {
        return this.lists;
    },
    // Update a list with new data
    updateList(listId, newData) {
        const index = this.lists.findIndex((l) => l.id === listId);
        if (index !== -1) {
            this.lists[index] = { ...this.lists[index], ...newData };
        }
    },
    // Update the status of a list based on its related purchases
    updateListStatus(listId) {
        const list = this.lists.find((l) => l.id === listId);
        if (list) {
            const relatedPurchases = this.purchases.filter((p) => p.listId === listId);
            list.checked = relatedPurchases.length > 0 && relatedPurchases.every((p) => p.checked);
        }
    },

};

export { todoModel };
