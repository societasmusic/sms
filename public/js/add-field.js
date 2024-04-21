$(document).ready(function() {
    $(".add_row").click(function(e) {
        e.preventDefault();
        $("#fieldRows").append(`
            <tr>
                <td class="fs-7">Item</td>
                <td>
                    <input type="text" class="form-control fs-7" name="itemName[]" id="itemName[]" required>
                    <div class="invalid-feedback fs-7">
                        This field cannot be left blank
                    </div>
                </td>
                <td>
                    <input type="date" class="form-control fs-7" name="itemDate[]" id="itemDate[]" required>
                    <div class="invalid-feedback fs-7">
                        This field cannot be left blank
                    </div>
                </td>
                <td>
                    <select name="itemType[]" id="itemType[]" class="form-select fs-7" required="">
                        <option value="" selected="" disabled="">Select one...</option>
                        <option value="Advertising">Advertising</option>               
                        <option value="Credit Card Fees">Credit Card Fees</option>
                        <option value="Department Supplies">Department Supplies</option>
                        <option value="Equipment (Purchase)">Equipment (Purchase)</option>
                        <option value="Equipment (Rental)">Equipment (Rental)</option>
                        <option value="Equipment (Purchase)">Equipment (Purchase)</option>
                        <option value="Hotel &amp; Lodging (Domestic)">Hotel &amp; Lodging (Domestic)</option>
                        <option value="Hotel &amp; Lodging (International)">Hotel &amp; Lodging (International)</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Meals">Meals</option>
                        <option value="Other">Other</option>
                        <option value="Postage &amp; Shipping">Postage &amp; Shipping</option>
                        <option value="Software &amp; Online Resources">Software &amp; Online Resources</option>
                        <option value="Space Rentals">Space Rentals</option>
                        <option value="Tickets">Tickets</option>
                        <option value="Travel (Airfare Domestic)">Travel (Airfare Domestic)</option>
                        <option value="Travel (Airfare International)">Travel (Airfare International)</option>
                        <option value="Travel (Ground Domestic)">Travel (Ground Domestic)</option>
                        <option value="Travel (Ground International)">Travel (Ground International)</option>
                        <option value="Travel (Other Domestic)">Travel (Other Domestic)</option>
                        <option value="Travel (Other International)">Travel (Other International)</option>
                        <option value="Vehicles Expense (Company Owned)">Vehicles Expense (Company Owned)</option>
                        <option value="Vehicles Expense (Individually Owned)">Vehicles Expense (Individually Owned)</option>
                    </select>
                    <div class="invalid-feedback fs-7">
                        This field cannot be left blank
                    </div>
                </td>
                <td>
                    <input type="text" class="form-control fs-7" name="itemAmount[]" id="itemAmount[]" placeholder="US Dollars - USD" required>
                    <div class="invalid-feedback fs-7">
                        This field cannot be left blank
                    </div>
                </td>
                <td>
                    <button type="button" class="btn btn-outline-danger fs-7 delete_row w-100">Delete</button>
                </td>
            </tr>
        `)
    });
    $(document).on("click", ".delete_row", function(e) {
        e.preventDefault();
        let row_item = $(this).parent().parent();
        $(row_item).remove();
    });
});