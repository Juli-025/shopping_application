import { todoController } from "./controller.js";
import { todoModel } from "./model.js";
import { todoView } from "./view.js";

document.addEventListener("DOMContentLoaded", () => {
    // Fetch JSON data (adjust the path if necessary)
    fetch("../json/data.json")
        .then((response) => response.json())
        .then((data) => {
            // Load items from JSON and render item cards
            data.items.forEach((item) => {
                todoModel.addItem(item);
                todoView.addItemCard(item);
            });

            // Load tags from JSON and render tag containers
            data.tags.forEach((tag) => {
                todoModel.addTag(tag);
                todoView.addTagToContainer(tag.title);
            });

            // Load friends from JSON and render friend entries
            data.friends.forEach((friend) => {
                todoModel.addFriend(friend);
                todoView.addFriendToContainer(friend.firstName, friend.lastName, friend.email);
            });

            // Load purchases from JSON and render shopping items
            data.purchases.forEach((purchase) => {
                todoModel.addPurchase(purchase);
                todoView.addShoppingItem(purchase.title, purchase.items, purchase.id);
            });

            // Load lists from JSON and render list entries using a slightly modified view function
            data.lists.forEach((list) => {
                todoModel.addList(list);
                todoView.addListToContainer(list.title, list.purchases, list.id);
            });

            // Initialize the controller
            todoController.init();
        })
        .catch((error) => {
            console.error("Fehler beim Laden der JSON-Daten:", error);
            // Initialize the controller even if JSON data fails to load
            todoController.init();
        });
});
