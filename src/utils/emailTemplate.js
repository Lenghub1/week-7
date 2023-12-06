export function generateCartItemHTML(cartItem) {
    return `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd">
          ${cartItem.productTitle}
        </td>
        <td style="padding: 10px; border: 1px solid #ddd">
          ${cartItem.quantity}
        </td>
        <td style="padding: 10px; border: 1px solid #ddd">
          $${cartItem.itemPrice.toFixed(2)}
        </td>
        <td style="padding: 10px; border: 1px solid #ddd">
          $${(cartItem.itemPrice * cartItem.quantity).toFixed(2)}
        </td>
      </tr>
    `;
  }