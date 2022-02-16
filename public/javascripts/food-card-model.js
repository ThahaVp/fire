var modalWrap = null;
const showModal = (title, description, price) => {
  if (modalWrap !== null) {
    modalWrap.remove();
  }

  modalWrap = document.createElement('div');
  modalWrap.innerHTML = `
    <div class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
        <div style="width:100%;height:200px;background-color:red"></div>
          <div class="modal-body">
            <p>${title}</p>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success modal-success-btn" data-bs-dismiss="modal">ADD &#8377;${price}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  //   modalWrap.querySelector('.modal-success-btn').onclick = callback;

  document.body.append(modalWrap);

  var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'));
  modal.show();
}


var cartWrap = null;
const showCart = (title) => {
  if (cartWrap !== null) {
    cartWrap.remove();
  }

  cartWrap = document.createElement('div');
  cartWrap.innerHTML = `
    <div class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">

          <div class="modal-header p-3">
            <h6 class="modal-title">Cart Items</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
            <p>Modal body text goes here.</p>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <a href="example/cart"><button type="button" class="btn btn-success">Continue &#8377;245.0</button></a>
          </div>
        </div>
      </div>
    </div>
  `;

  //   modalWrap.querySelector('.modal-success-btn').onclick = callback;

  document.body.append(cartWrap);

  var modal = new bootstrap.Modal(cartWrap.querySelector('.modal'));
  modal.show();
}