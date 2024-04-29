$(document).ready(function() {
    $(".add_row").click(function(e) {
        e.preventDefault();
        $("#fieldRows").append(`
            <tr>
                <td class="fs-7">Item</td>
                <td>
                    <select name="s1" id="s1" class="form-select fs-7 s1">
                        <option value="" selected hidden disabled>Select one...</option>
                        <% items.forEach(e => { %>
                            <option value="<%= e.id %>"><%= `${e.itemType}: ${e.name}` %></option>
                        <% }) %>
                    </select>
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