$(document).ready(function () {
    $("a").click(function () {
        chrome.tabs.create({ active: true, url: $(this).attr("href") });
    });

    chrome.storage.sync.get(null, function (settings) {
        $('input[name=enabled]').prop("disabled",false);
        $('input[name=enabled][value=' + settings["enabled"] + ']').prop("checked", true);
        $('input[name=enabled]').change(function(){
            $('input[name=enabled]').prop("disabled",true);
            chrome.storage.sync.set({ 'enabled': $(this).val() }, function (settings) {
                $('input[name=enabled]').prop("disabled",false);
            });
        });

        $.ajax({
            url: "https://jamakflix.herokuapp.com/api/languages/",
            success: function (response) {
                $("#ddlLanguages").append(response.map(function (l) {
                    return $("<option name='language' value='" + l.SubLanguageID + "'" + (settings.language == l.SubLanguageID ? "selected='selected'" : "") + ">" + l.LanguageName + "</option>")
                }));
                $("#ddlLanguages").prop("disabled", false);
                $("#ddlLanguages").change(function () {
                    $("#ddlLanguages").prop("disabled", true);
                    chrome.storage.sync.set({ 'language': $(this).val() }, function (settings) {
                        $("#ddlLanguages").prop("disabled", false);
                    });
                });
            }
        });
    });
});