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
                    <input type="text" class="form-control fs-7" name="itemDate[]" id="itemDate[]" required>
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