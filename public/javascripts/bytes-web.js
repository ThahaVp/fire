var modalWrap = null;
const showModal = () => {
  if (modalWrap !== null) {
    modalWrap.remove();
  }

  modalWrap = document.createElement('div');
  modalWrap.innerHTML = `
    

  <div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" data-keyboard="false"  data-backdrop="static">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-body">
      <p>Enable order alert sound first and check wheather everything works fine</p>
      <button type="button" class="btn btn-success btn-block" data-bs-dismiss="modal">Enable Order Alert</button>
      </div>
    </div>
  </div>
</div>

  `;


  document.body.append(modalWrap);
  var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'));
  modal.show();
}

showModal()


