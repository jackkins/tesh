function setCanvas(){
    var _c = $(".patern_view .page canvas");

    var _width_page = _c.closest(".page").width();
    var _height_page = _c.closest(".page").height();

    _c.attr({
        'width':_width_page,
        'height':_height_page
    })

    $("#for_save_img").attr({
        'width':_width_page,
        'height':_height_page
    })
    $("#temp_canvas").attr({
        'width':_width_page,
        'height':_height_page
    })
    //console.log(_width_page+" "+_height_page);
}
function mob_version(){
    if($(window).width()<=860){
        $(".patern_view").attr("data-window","mobile");
        mobile = true;

        glob_w = $(window).width();
        canv_w = glob_w - 110;
        canv_h = canv_w*1.411;
        $(".patern_view .page").css({
            'width':canv_w,
            'height':canv_h
        })
        $(".select_menu_item").width(glob_w);
        $(".items_block .item").width(canv_w);
        $(".items_block").width(canv_w);
        tc_w = canv_w*1.1;
        $(".top_panel").height(tc_w);
        console.log("ok");
    }
}
var mobile = false; /** включен моб режим или нет */
setCanvas();

var preview_imgs = []; /** загруженные фото в "свой дизайн" */
var imgs = []; /* массив изображений */
var shablon = { /* Тестовый шаблон */
    'id': null, /* save */
    'name':'', /* save */
    'price':0, /* save */
    'massa':0, /* save */
    'size': 0,/* save */
    'resolut':'', /* save */
    'type_page':{ /* save */
        'opt':'',
        'pages':''
    },
    'lang_page':{ /* save */
        'opt':'',
        'pages':''
    },
    'format':'', /* save */
    'binding':'', /* save */
    'cover':{ /* save */
        'opt':'',
        'color':''
    },
    'pages':[], /* save */
    'imgs':[]
    /*подробно, что в страницах в функции addEmptyPages*/
};
var format_page = {
    'a4':{
        'x':2480,
        'y':3508
    },
    'a5':{
        'x':1754,
        'y':2480
    },
    'a6':{
        'x':1240,
        'y':1754
    },
    'a7':{
        'x':877,
        'y':1240
    }
}
var can_pages = []; /* прошлое состояние (prev)*/
var res_pages = []; /* состояние восстановления (next)*/
var copiedObject = null; /** массив лоя копирования объектов */
var active_tool = null; /* активный инструмент */
var canvas_left = new fabric.Canvas('left_page_canvas'); /* канвас левой страницы */
var canvas_right = new fabric.Canvas('right_page_canvas'); /* канвас правой страницы */
var line, _t = null, _opt = null, _value = null, s_page = null, temp_bg_img = null, _temp_x = null, _tenp_y = null, par = null;
    var ctrlDown = false,
        ctrlKey = 17,
        cmdKey = 91,
        vKey = 86,
        cKey = 67;
var id = null;
var canmove = false; /* для инструмента - линия. возможно двигать мышь и изменять текуюущю линию */
var canmove_style = false;
var style_move = false; /* было ли движение шаблона при перемещении */
var active_canvas = canvas_left; /* для быстрого доступа к текущему канвасу */
canvas_left.selection = false;
canvas_right.selection = false;
canvas_left.freeDrawingCursor = 'url(/img/icons/pencil-draw.png) 2 2,pointer';
canvas_right.freeDrawingCursor = 'url(/img/icons/pencil-draw.png) 2 2,pointer';


$(document).ready(function(){
    //checkLogin();
    console.log("check");
    $("body").on('click','#ok_btn_join',function(){
        close_modal($(".alert"));
        $(".log_btns .login").trigger('click');
    }).on('click',".tools_block .icon_pencil",function(){
        // console.log('pencil-active');
        if(active_tool!=null && active_tool!='icon_pencil'){
            $("."+active_tool).trigger('click');
            console.log('pencil-active');
        }
        if($(this).hasClass("active")){
            console.log('pencil-active');
            $(this).removeClass("active");
            $(".page").removeClass("active_pencil");
            canvas_left.isDrawingMode = false;
            canvas_right.isDrawingMode = false;
            active_tool = null;
        }
        else{
            $(this).addClass("active");
            $(".page").addClass("active_pencil");
            canvas_left.isDrawingMode = true;
            canvas_right.isDrawingMode = true;
            active_tool = 'icon_pencil';
        }
    }).on('click','.tools_block .icon_line',function(){
        if(active_tool!=null && active_tool!='icon_line'){
            $("."+active_tool).trigger('click');
        }
        if($(this).hasClass("active")){
            $(this).removeClass("active");
            active_tool = null;
            eventedObjects(true);
        }
        else{
            $(this).addClass("active");
            active_tool = 'icon_line';
            eventedObjects(false);
        }
    }).on('click','.icon_delete',function(){
        if(active_canvas.getActiveObject()!=null){
            active_canvas.getActiveObject().remove();
            updatepage(parseInt($(".patern_view .page.active").attr("data-number-page")));
        }
    }).on('mousedown','.patern_view .page',function(e){
        id_page = $(this).attr("data-number-page");
        if(shablon['pages'][id_page]['fullness']!='delete'){
            $(".patern_view").find(".page.active").removeClass("active");
            $(this).addClass("active");
            id_canvas = $(this).attr("data-id-canvas");
            active_canvas = eval("canvas_"+id_canvas);

            if(active_tool=="icon_line"){
                var _Offset = $(this).offset();
                f_x = parseInt(e.pageX-_Offset.left);
                f_y = parseInt(e.pageY-_Offset.top);

                line = new fabric.Line([f_x,f_y,f_x+1,f_y+1], {
                    stroke: '#000',
                    strokeWidth: 1
                })
                active_canvas.add(line);
                //active_canvas.renderAll();
                canmove = true;
            }
        }
    }).on('mousemove','.patern_view .page',function(e){
        if(active_tool=="icon_line" && canmove){
            var _Offset = $(this).offset();
            x = e.pageX-_Offset.left;
            y = e.pageY-_Offset.top;
            line.set('x2',x);
            line.set('y2',y);
            active_canvas.renderAll();
        }
    }).on('mouseup','.patern_view .page',function(e){
        if(active_tool=="icon_line"){
            //active_tool = null;
            canmove = false;
            obj = active_canvas.getObjects();
            last = active_canvas._objects[active_canvas._objects.length-1];
            active_canvas.remove(last);
            active_canvas.add(line);
            eventedObjects(false);
        }
        updatepage(parseInt($(this).attr("data-number-page")));
    }).on('click','.tools_block .icon_polygon',function(){
        if(active_tool!=null && active_tool!='icon_polygon'){
            $("."+active_tool).trigger('click');
        }
        open_modal($(".polygon_count"));
    }).on('click','#add_polygon',function(){

        if(active_canvas == null){
            alert("Выберите активную страницу");
            console.log(active_canvas);
        }
        else{
            var n = $(".polygon_count .count").val();
            if(n<3){
                alert("Углов должно быть более 3х");
            }
            else{
                close_modal($(".polygon_count"));
                var h = $(".patern_view .left_page").height();
                var w = $(".patern_view .left_page").width();
                r = 60;
                parr = new Array();
                for(i=0;i<=n;i++){
                    x = Math.round(w/2)+r*Math.cos((2*Math.PI*i)/n);
                    y = Math.round(h/2)+r*Math.sin((2*Math.PI*i)/n);
                    parr.push({'x':x,'y':y});
                }

                var pol = new fabric.Polygon(parr, {
                    left: 200,
                    top: 150,
                    angle: 0,
                    stroke: '#000',
                    strokeWidth: 1,
                    fill: 'transparent'
                  }
                );

                active_canvas.add(pol);

                id_page = parseInt($(".patern_view .page.active").attr("data-number-page"));

                updatepage(id_page);
            }
        }
    }).on('click',"#addpages",function(){
        /*open_modal($("#addpages_block"));*/
        $("#addpages_block").attr("data-opt","none");
        open_slide(slides["pages"][0]);
    }).on('click','.manipular_block .left_manipular',function(){
        if(can_pages.length>0){
            can_page = can_pages[can_pages.length-1];
            res_pages.push({'id_page':can_page['id_page'],'json':shablon['pages'][can_page['id_page']]['canvas'],'draw':shablon['pages'][can_page['id_page']]['draw'],'fullness':shablon['pages'][can_page['id_page']]['fullness']});
            shablon['pages'][can_page['id_page']]['canvas'] = can_page['json'];
            shablon['pages'][can_page['id_page']]['draw'] = can_page['draw'];
            shablon['pages'][can_page['id_page']]['fullness']=can_page['fullness'];
            //canvas_left.loadFromJSON(can_page['json'], function(){canvas_left.renderAll()});
            can_pages.splice(can_pages.length-1,1);
            //console.log(can_page['id_page']);
            renderActivePages();
        }
    }).on('click','.manipular_block .right_manipular',function(){
        if(res_pages.length>0){
            res_page = res_pages[res_pages.length-1];
            can_pages.push({'id_page':res_page['id_page'],'json':shablon['pages'][res_page['id_page']]['canvas'],'draw':shablon['pages'][res_page['id_page']]['draw'],'fullness':shablon['pages'][res_page['id_page']]['fullness']});
            shablon['pages'][res_page['id_page']]['canvas'] = res_page['json'];
            shablon['pages'][res_page['id_page']]['draw'] = res_page['draw'];
            shablon['pages'][res_page['id_page']]['fullness']=res_page['fullness'];
            //canvas_left.loadFromJSON(res_page['json'], function(){canvas_left.renderAll()});
            res_pages.splice(res_pages.length-1,1);
            //console.log(can_page['id_page']);
            renderActivePages();
        }
    }).on('click','input#addpages_btn',function(){
        opt = $(this).closest(".modal_block").attr("data-opt");
        fullness = $(this).closest(".modal_block").attr("data-fullness");
        from_id = parseInt($(this).closest(".modal_block").attr("data-from-id"));
        id_canvas = $(this).closest(".modal_block").attr("data-id-canvas");
        action = $(this).closest(".modal_block").attr("data-action")!=null ? $(this).closest(".modal_block").attr("data-action") : null;
        count = parseInt($(".addpages_block .count").val());
        page_error = false;

        if( (count + getNotEmptyPages())>shablon['pages'].length ){
            page_error = true;
            open_modal($(".alert"));
            $("#alert .content_block").html("<span class='title'>Превышено количество страниц в блокноте</span><input type='button' id='ok_btn' value='Ок'>");
        }
        else{
            switch(opt){
                case '3_month':{
                    if(count == 1){
                        for(i=0;i<shablon['pages'].length;i++){
                            if(shablon['pages'][i]['style_page']=='3_month'){
                                page_error = true;
                            }
                        }
                        if(page_error){
                            open_modal($(".alert"));
                            $("#alert .content_block").html("<span class='title'>Превышено количество 3х месячного шаблона</span><input type='button' id='ok_btn' value='Ок'>");
                        }
                    }
                    else if(count>1){
                        page_error = true;
                        open_modal($(".alert"));
                        $("#alert .content_block").html("<span class='title'>Можно добавить не более 1 страницы данного шаблона</span><input type='button' id='ok_btn' value='Ок'>");
                    }
                    break;
                }
                case 'month':{
                    if(count<=3){
                        t_pages = 0;
                        for(i=0;i<shablon['pages'].length;i++){
                            if(shablon['pages'][i]['style_page']=='month'){
                                t_pages++;
                            }
                        }
                        if(t_pages==3 || count+t_pages>3){
                            page_error = true;
                            open_modal($(".alert"));
                            $("#alert .content_block").html("<span class='title'>Превышено количество месячного шаблона</span><input type='button' id='ok_btn' value='Ок'>");
                        }
                    }
                    else{
                        page_error = true;
                        open_modal($(".alert"));
                        $("#alert .content_block").html("<span class='title'>Можно добавить не более 3 страниц данного шаблона</span><input type='button' id='ok_btn' value='Ок'>");
                    }
                    break;
                }
                case 'week':{
                    if(count<=15){
                        t_pages = 0;
                        for(i=0;i<shablon['pages'].length;i++){
                            if(shablon['pages'][i]['style_page']=='week'){
                                t_pages++;
                            }
                        }
                        if(t_pages==15 || count+t_pages>15){
                            page_error = true;
                            open_modal($(".alert"));
                            $("#alert .content_block").html("<span class='title'>Превышено количество недельного шаблона</span><input type='button' id='ok_btn' value='Ок'>");
                        }
                    }
                    else{
                        page_error = true;
                        open_modal($(".alert"));
                        $("#alert .content_block").html("<span class='title'>Можно добавить не более 15 страниц данного шаблона</span><input type='button' id='ok_btn' value='Ок'>");
                    }
                    break;
                }
                case 'day':{
                    if(count<=93){
                        t_pages = 0;
                        for(i=0;i<shablon['pages'].length;i++){
                            if(shablon['pages'][i]['style_page']=='day'){
                                t_pages++;
                            }
                        }
                        if(t_pages==93 || count+t_pages>93){
                            page_error = true;
                            open_modal($(".alert"));
                            $("#alert .content_block").html("<span class='title'>Превышено количество дневного шаблона</span><input type='button' id='ok_btn' value='Ок'>");
                        }
                    }
                    else{
                        page_error = true;
                        open_modal($(".alert"));
                        $("#alert .content_block").html("<span class='title'>Можно добавить не более 93 страницы данного шаблона</span><input type='button' id='ok_btn' value='Ок'>");
                    }
                    break;
                }
            }
        }
        if(!page_error){
            var temp_canvas = new fabric.Canvas('temp_canvas');
            temp_canvas.setBackgroundImage(temp_bg_img,function(){
                temp_canvas.backgroundImage.width = temp_canvas.getWidth();
                temp_canvas.backgroundImage.height = temp_canvas.getHeight();
                temp_canvas.renderAll.bind(temp_canvas);
            });
            setTimeout(function(){
                var temp_canvas_json = JSON.stringify(temp_canvas);
                last_id = 0;
                switch(action){
                    case 'add':{
                        from_temp_id = parseInt(from_id+1);
                        console.log(from_temp_id);
                        for(i=0;i<count;i++){
                            last_id = from_temp_id;
                            if(shablon['pages'][from_temp_id]['fullness']!='empty'){
                                var empt_id_page = 0;
                                var e_e = true;
                                for(j=from_temp_id;j<shablon['pages'].length;j++){
                                    if(e_e){
                                        if(shablon['pages'][j]['fullness']=='empty'){
                                            empt_id_page = j;
                                            e_e = false;
                                        }
                                    }
                                }
                                console.log(" -"+empt_id_page+" - "+from_temp_id);
                                for(k=empt_id_page;k>from_temp_id;k--){
                                    prev_id = k-1;
                                    shablon['pages'][k]['canvas'] = shablon['pages'][prev_id]['canvas'];
                                    shablon['pages'][k]['draw'] = shablon['pages'][prev_id]['draw'];
                                    shablon['pages'][k]['fullness'] = shablon['pages'][prev_id]['fullness'];
                                    shablon['pages'][k]['style_page'] = shablon['pages'][prev_id]['style_page'];
                                    //console.log("k - "+prev_id);
                                }
                                shablon['pages'][from_temp_id]['canvas'] = temp_canvas_json;
                                shablon['pages'][from_temp_id]['fullness'] = 'notempty';
                                shablon['pages'][from_temp_id]['style_page'] = opt;
                                shablon['pages'][from_temp_id]['draw'] = false;
                            }
                            else{
                                shablon['pages'][from_temp_id]['canvas'] = temp_canvas_json;
                                shablon['pages'][from_temp_id]['fullness'] = 'notempty';
                                shablon['pages'][from_temp_id]['style_page'] = opt;
                                shablon['pages'][from_temp_id]['draw'] = false;
                            }
                            from_temp_id++;
                        }
                        break;
                    }
                    case 'replace':{
                        from_temp_id = from_id;
                        console.log(from_temp_id);
                        for(i=0;i<count;i++){
                            last_id = from_temp_id;
                            if(shablon['pages'][from_temp_id]['fullness']!='empty' && from_temp_id!=from_id){
                                var empt_id_page = 0;
                                var e_e = true;
                                for(j=from_temp_id;j<shablon['pages'].length;j++){
                                    if(e_e){
                                        if(shablon['pages'][j]['fullness']=='empty'){
                                            empt_id_page = j;
                                            e_e = false;
                                        }
                                    }
                                }
                                console.log(" -"+empt_id_page+" - "+from_temp_id);
                                for(k=empt_id_page;k>from_temp_id;k--){
                                    prev_id = k-1;
                                    shablon['pages'][k]['canvas'] = shablon['pages'][prev_id]['canvas'];
                                    shablon['pages'][k]['draw'] = shablon['pages'][prev_id]['draw'];
                                    shablon['pages'][k]['fullness'] = shablon['pages'][prev_id]['fullness'];
                                    shablon['pages'][k]['style_page'] = shablon['pages'][prev_id]['style_page'];
                                    //console.log("k - "+prev_id);
                                }
                                shablon['pages'][from_temp_id]['canvas'] = temp_canvas_json;
                                shablon['pages'][from_temp_id]['fullness'] = 'notempty';
                                shablon['pages'][from_temp_id]['style_page'] = opt;
                                shablon['pages'][from_temp_id]['draw'] = false;
                            }
                            else{
                                shablon['pages'][from_temp_id]['canvas'] = temp_canvas_json;
                                shablon['pages'][from_temp_id]['fullness'] = 'notempty';
                                shablon['pages'][from_temp_id]['style_page'] = opt;
                                shablon['pages'][from_temp_id]['draw'] = false;
                            }
                            from_temp_id++;
                        }
                        break;
                    }
                    case null:{
                        from_temp_id = from_id;
                        for(i=0;i<count;i++){
                            last_id = from_temp_id;
                            if(shablon['pages'][from_temp_id]['fullness'] == 'empty'){
                                shablon['pages'][from_temp_id]['canvas'] = temp_canvas_json;
                                shablon['pages'][from_temp_id]['fullness'] = 'notempty';
                                shablon['pages'][from_temp_id]['style_page'] = opt;
                                from_temp_id++;
                            }
                            else{
                                e_e = true;
                                for(j=from_temp_id;j<shablon['pages'].length;j++){
                                    if(e_e){
                                        if(shablon['pages'][j]['fullness']=='empty'){
                                            from_temp_id = j;
                                            e_e = false;
                                            i--;
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
                temp_bg_img = null;
                $("#addpages_block").attr("data-fullness","");
                $("#addpages_block").attr("data-from-id","");
                $("#addpages_block").attr("data-id-canvas","");
                close_modal($("#addpages_block"));
                if(count>2){
                    _lp = last_id;
                    _rp = last_id+1;
                    if(last_id%2!=0){
                        _lp = last_id-1;
                        _rp = last_id;
                    }
                    $(".page.left_page").attr("data-number-page",_lp);
                    $(".page.right_page").attr("data-number-page",_rp);
                }
                renderActivePages();
                console.log(shablon);
            },50);
        }
       // opt = null;
    }).on('click','input#action_addpages',function(){
        close_modal($("#actionpages_block"));
        $("#addpages_block").attr("data-action","add");
        open_modal($("#addpages_block"));
    }).on('click','input#action_replacepages',function(){
        close_modal($("#actionpages_block"));
        $("#addpages_block").attr("data-action","replace");
        open_modal($("#addpages_block"));
    }).on('click','.patern_view .arrow_left',function(){
        id_page = parseInt($(".page[data-id-canvas='left']").attr("data-number-page"));

        if(!mobile){
            next_page = id_page-2;
            next_right_page = id_page-1;
        }
        else{
            next_page = id_page-1;
        }

        if(typeof shablon['pages'][next_page] !== 'undefined'){
            $(".page[data-id-canvas='left']").attr("data-number-page",next_page);
        }

        if(!mobile){
            if(typeof shablon['pages'][next_right_page] !== 'undefined'){
                $(".page[data-id-canvas='right']").attr("data-number-page",next_right_page);
            }
        }

        renderActivePages();
    }).on('click','.patern_view .arrow_right',function(){
        id_page = parseInt($(".page[data-id-canvas='left']").attr("data-number-page"));

        if(!mobile){
            next_page = id_page+2;
            next_right_page = id_page+3;
        }
        else{
            next_page = id_page+1;
        }

        if(typeof shablon['pages'][next_page] !== 'undefined'){
            $(".page[data-id-canvas='left']").attr("data-number-page",next_page);
            if(!mobile){
                if(typeof shablon['pages'][next_right_page] !== 'undefined'){
                    $(".page[data-id-canvas='right']").attr("data-number-page",next_right_page);
                }
                else{
                    $(".page[data-id-canvas='right']").attr("data-number-page","none");
                }
            }
        }

        renderActivePages();
    }).on('click','.del_page input[name="no"]',function(){
        id_page = parseInt($("#del_page").attr("data-page"));
        id_canvas = $(".page[data-number-page='"+id_page+"']").attr("data-id-canvas");
        can_pages = [];
        res_pages = [];

        //shablon['pages'][id_page]['fullness'] = 'delete';
        shablon['pages'][id_page]['fullness'] = 'empty';
        shablon['pages'][id_page]['canvas'] = '{"objects":[]}';
        shablon['pages'][id_page]['style_page'] = 'none';
        shablon['pages'][id_page]['draw'] = false;
        renderActivePages();
        close_modal($(".del_page"));
    }).on('click','.del_page input[name="yes"]',function(){
        id_page = parseInt($("#del_page").attr("data-page"));
        id_canvas = $(".page[data-number-page='"+id_page+"']").attr("data-id-canvas");

        can_pages = [];
        res_pages = [];

        temp_page = null;

        for(i=id_page;i<shablon['pages'].length;i++){
            if(i!=shablon['pages'].length-1){
                t = i+1;
                shablon['pages'][i]['canvas'] = shablon['pages'][t]['canvas'];
                shablon['pages'][i]['draw'] = shablon['pages'][t]['draw'];
                shablon['pages'][i]['fullness'] = shablon['pages'][t]['fullness'];
                shablon['pages'][i]['style_page'] = shablon['pages'][t]['style_page'];
            }
            else{
                shablon['pages'][i]['canvas'] = '{"objects":[]}';
                shablon['pages'][i]['draw'] = false;
                shablon['pages'][i]['fullness'] = 'empty';
                shablon['pages'][i]['style_page'] = 'none';
            }
        }
        renderActivePages();
        close_modal($(".del_page"));
    }).on('click','.page[data-fullness-page="delete"] .close_icon',function(){
        if(getNotDeletedPages()>1){
            id_page = parseInt($(this).closest(".page").attr("data-number-page"));
            id_canvas = $(".page[data-number-page='"+id_page+"']").attr("data-id-canvas");

            can_pages = [];
            res_pages = [];


        }
        else{
            alert("Последнюю страницу нельзя удалить");
        }
    }).on('click','.icon_save',function(){
        if(checkLogin()){
            chk_sh = checkshablon();
            if(!chk_sh){
                if(shablon['name'] == null){
                    icon_ = $(this);
                    coords = icon_.offset();
                    page_x = coords.left - $(window).scrollLeft()+60;
                    page_y = coords.top - $(window).scrollTop()+10;
                    open_modal($(".save_sh_block"));
                    /*$(".save_sh_block").css({
                        'position':'absolute',
                        'top': page_y,
                        'left': page_x
                    })*/
                    console.log("1");
                }
                else{
                    save_shablon();
                    console.log("2");
                    console.log(shablon);
                }
            }
        }
    }).on('click','.name_new_sh input[type="button"].cancel',function(){
        close_modal($(".save_sh_block"));
        close_modal($(".name_new_sh"));
    }).on('click','.save_sh_block input[name="yes"]',function(){
            open_modal($(".name_new_sh"));
            console.log("yes");
    }).on('click','.save_sh_block input[name="no"]',function(){
        close_modal($(".save_sh_block"));
    }).on('click','.name_new_sh input[type="button"].save',function(){
            name = $(".name_new_sh input[name='sh_name']").val();
            if(name!=''){
                shablon['name'] = name;
                //export_shablon();
                save_shablon();
                close_modal($(".save_sh_block"));
                close_modal($(".name_new_sh"));
            }
    }).on('click','.dropdown .title label.checkbox',function(){
        name = $(this).attr("name");
        var value = '';
        console.log(name);

        setTimeout(function(){
            value = $("input[name='"+name+"']:checked").val();
            switch(name){
                case 'format':{
                    shablon['format'] = value;

                    open_slide(slides['format'][value]);
                    break;
                }
                case 'binding':{
                    shablon['binding'] = value;
                    open_slide(slides['binding'][value]);
                    break;
                }
                case 'cover':{
                    if(shablon['format'] == ''){
                        $("input[name='cover']").prop('checked', false);

                        open_modal($("#alert"));
                        $("#alert .content_block").html("<span class='title'>Сначала нужно выбрать желаемый формат</span><input type='button' data-menu='format' id='open_menu' value='Выбрать формат'>");
                    }
                    else if(shablon['binding'] == ''){
                        $("input[name='cover']").prop('checked', false);

                        open_modal($("#alert"));
                        $("#alert .content_block").html("<span class='title'>Для Вашего удобства, следует сначала выбрать желаемый переплет</span><input type='button' data-menu='binding' id='open_menu' value='Выбрать переплет'>");
                    }
                    else{
                        shablon['cover']['opt'] = value;
                        open_slide(slides['cover'][value]);
                        var el = $("body");
                        $('body').animate({
                            scrollTop: $(el).offset().top - 51
                        }, 2000);
                    }
                    break;
                }
            }

        },10)
        var slider_name =  $(this).attr('for');
        $('.owl-carousel').fadeOut();
        $('#items_slides').hide();
        $('.owl-carousel').removeClass('fadedIn');
        $('.owl-carousel[data-slider='+ slider_name +']').addClass('fadedIn').fadeIn();
        // console.log(slider_name);
    }).on('click','.lang_menu_item',function(){
        _this = $(this);
        if(_this.closest('.dropdown_menu').siblings(".select_menu_item").is(":visible")){
            _this.closest('.dropdown_menu').siblings(".select_menu_item").hide();
        }
        else{
            _this.closest('.dropdown_menu').siblings(".select_menu_item").show();
             _t = "lang_menu_item";
            _opt = $(this).attr("data-opt");
            if(shablon['lang_page']['opt'] != ''){
                if(_opt == shablon['lang_page']['opt']){
                    var val = shablon['lang_page']['pages'];
                    if(val != 'all') val = 0;
                    _this.closest('.dropdown_menu').siblings(".select_menu_item").find("input[name='lang_page'][value='"+val+"']").prop('checked', true);
                }
                else{
                    _this.closest('.dropdown_menu').siblings(".select_menu_item").find("input[name='lang_page']").prop('checked', false);
                }
            }
        }
    }).on('click','.type_menu_item',function(){
        _t = "type_menu_item";
        _opt = $(this).attr("data-opt");
        _this = $(this);
        _this.closest('.dropdown_menu').siblings(".select_menu_item").show();
        if(shablon['type_page']['opt'] != ''){
            if(_opt == shablon['type_page']['opt']){
                var val = shablon['type_page']['pages'];
                if(val != 'all') val = 0;
                _this.closest('.dropdown_menu').siblings(".select_menu_item").find("input[name='type_page'][value='"+val+"']").prop('checked', true);
            }
            else{
                _this.closest('.dropdown_menu').siblings(".select_menu_item").find("input[name='type_page']").prop('checked', false);
            }
        }
    }).on('click','.style_menu_item',function(){
        $("#items_slides .owl-stage").html("");
        _opt = $(this).attr("data-opt");
        _this = $(this);
        _this.closest('.dropdown_menu').siblings(".select_menu_item").show();
        _this.closest('.dropdown_menu').siblings(".select_menu_item").find("input[name='style_page']").prop('checked',false);
        console.log(_opt);
    }).on('click','label.checkbox[name="style_page"]',function(){
        //open_modal($(".addpages_block"));
        _v = $(this).siblings("input").val();
        console.log(_v+" "+_opt);
        $(".addpages_block").attr("data-opt",_v);
        // open_slide(slides['style_page'][_opt][_v]);
        var slider_name =  _v + _opt;
        $('.owl-carousel').fadeOut();
        $('#items_slides').hide();
        $('.owl-carousel').removeClass('fadedIn');
        $('.owl-carousel[data-slider='+ slider_name +']').addClass('fadedIn').fadeIn();
        _v = null;
    }).on('click','div[data-menu="settings"] .select_menu_item label.checkbox',function(){
        var name = $(this).attr("name");
        var value = '';
        setTimeout(function(){
            value = $("input[name='"+name+"']:checked").val();
            if(value=='0'){
                value = shablon['pages'][$(".patern_view .page.active").attr("data-number-page")]['number'];
            }
            switch(_t){
                case 'lang_menu_item':{
                    shablon['lang_page']['opt'] = _opt;
                    shablon['lang_page']['pages'] = value;
                    break;
                }
                case 'type_menu_item':{
                    shablon['type_page']['opt'] = _opt;
                    shablon['type_page']['pages'] = value;
                    break;
                }
            }
            $("."+_t).removeClass("active");
            $("."+_t+"[data-opt='"+_opt+"']").addClass("active");
            title = $("."+_t+"[data-opt='"+_opt+"']").text();
            $("."+_t+"[data-opt='"+_opt+"']").closest(".dropdown_menu").siblings(".title").children(".hide_drop").text(title);
            $("."+_t+"[data-opt='"+_opt+"']").closest(".dropdown_menu").siblings(".title").trigger('click');
            _opt = null;
            _t = null;
        },10);
    }).on('click','.item.info_item .info label.checkbox',function(){
        name = $(this).attr("name");
        setTimeout(function(){
            value = $("input[name='"+name+"']:checked").val();
            shablon['cover']['color'] = value;
        },50)
    }).on('click','.special_funct .item',function(){
        image = $(this).attr("data-image");
        fabric.Image.fromURL(image,function(oImg){
            active_canvas.add(oImg);

        })
        updatepage(parseInt($(".patern_view .page.active").attr("data-number-page")));
    }).on('click','#my_design',function(){
        $(".my_design").show();
    }).on('click','.preview .arrow_right',function(){
        _this = $(".preview.image_view .images_block");
        _item = _this.find(".items_block_line.active").attr("data-item");
        _item++;
        items_length = preview_imgs.length;
        if(_item==items_length) _item = 0;
        _this.find(".items_block_line.active .item").css("background-image","url("+preview_imgs[_item]+")");
        _this.find(".items_block_line.active").attr("data-item",_item);
        console.log(preview_imgs.length);
    }).on('click','.preview .arrow_left',function(){
        _this = $(".preview.image_view .images_block");
        _item = _this.find(".items_block_line.active").attr("data-item");
        items_length = preview_imgs.length;
        if(_item==0) _item = items_length-1;
        else _item--;

        _this.find(".items_block_line.active .item").css("background-image","url("+preview_imgs[_item]+")");
        _this.find(".items_block_line.active").attr("data-item",_item);
    }).on('click','.my_design input.cancel',function(){
        $(".my_design .items_block_line > .item").css("background-image",'none');
        $(".my_design input[name='view_last']").prop('checked',false);
        $(".my_design .comment_area").val("");
        preview_imgs = [];
        $(".my_design").hide();
    }).on('click','.my_design input.save',function(){
        view_last = $(".my_design input[name='view_last']:checked").val();
        comment = $(".my_design .comment_area").val();
        /* тут можно запрос на вход которого будет еще массив preview_imgs*/
        /*$.ajax({
            url: "",
            data:{
                'imgs':preview_imgs,
                'view_last':view_last,
                'comment':comment
            }
        })*/
        preview_imgs = [];
        $(".my_design").hide();
    }).on('selectstart','.items_block_line',function(){
        return false;
    }).on('mousedown','.page_style',function(e){
        setTimeout(function(){
            canmove_style = true;
        },50);
        _this = $(this);
        temp_bg_img = $(this).attr("data-style");
        _this.focus();
        _temp_page = $("#page_style_temp");
        _temp_page.width(_this.width());
        _temp_page.height(_this.height());
        f_x = parseInt(_this.offset().left);
        f_y = parseInt(_this.offset().top);
        _temp_page.css({
            'left':f_x,
            'top':f_y,
            'background-image':'url('+temp_bg_img+')'
        })
        _temp_x = parseInt(e.pageX);
        _temp_y = parseInt(e.pageY);
    }).on('mousemove',document,function(e){
        if(canmove_style){
            console.log("style move");
            _temp_page = $("#page_style_temp");
            _temp_page.show();
            f_x = parseInt(e.pageX);
            f_y = parseInt(e.pageY);
            _left = parseInt(_temp_page.css("left").replace(/[^-\d\.]/g, ''));
            _top = parseInt(_temp_page.css("top").replace(/[^-\d\.]/g, ''));
            _p_x = _left-(_temp_x - f_x);
            _p_y = _top-(_temp_y - f_y);
            _temp_page.css({
                'left':_p_x,
                'top':_p_y
            })
            _temp_x = f_x;
            _temp_y = f_y;
            style_move = true;
        }
    }).on('mouseup',document,function(e){
        if(canmove_style){
            _patern_page = $(".pages_block");
            _temp_page = $("#page_style_temp");
            f_x = parseInt(_patern_page.offset().left);
            f_y = parseInt(_patern_page.offset().top);

            if((f_x <= _temp_x && _temp_x <= f_x+_patern_page.width()) && (f_y <= _temp_y && _temp_y <= f_y+_patern_page.height()) ){

                //open_modal($("#addpages_block"));
                return_info = checkTypeIdcanvas(_temp_x,_temp_y);
                //console.log(return_info);
                switch(return_info['fullness']){
                    case 'empty':{
                        $("#addpages_block").attr("data-fullness","empty");
                        $("#addpages_block").attr("data-from-id",return_info['id_page']);
                        $("#addpages_block").attr("data-id-canvas",return_info['id_canvas']);
                        open_modal($("#addpages_block"));
                        break;
                    }
                    case 'notempty':{
                        $("#addpages_block").attr("data-fullness","notempty");
                        $("#addpages_block").attr("data-from-id",return_info['id_page']);
                        $("#addpages_block").attr("data-id-canvas",return_info['id_canvas']);
                        open_modal($("#actionpages_block"));
                        break;
                    }
                    case 'delete':{

                        break;
                    }
                }
            }
            canmove_style = false;
            _temp_page.hide().css({
                'background-image':'none'
            })
            style_move = false;
        }
    }).on('click','.slide_img',function(){
        if(!style_move){
            // par = $(this).parent();
            open_modal($(".view_item"));
            index_ = $(this).index();
            image_ = $(this).css("background-image");
            title = $(this).attr("title");
            console.log(image_, title, index_);
            $(".view_item").css("background-image",image_).attr("data-item",index_);
            $(".view_item .title").text(title);
        }
    }).on('click','.view_item .arrow_right',function(){
        index_of = $(this).closest(".modal_block").attr("data-item");
        top_panel_items = par.children(".slide_img").length;
        if(index_of==top_panel_items-1){
            index_of = 0;
        }
        else{
            index_of++;
        }
        elem_ = par.children(".slide_img").eq(index_of);
        image_ = elem_.css("background-image");
        title = elem_.attr("title");
        $(".view_item").css("background-image",image_).attr("data-item",index_);
        $(".view_item .title").text(title);
        $(this).closest(".modal_block").attr("data-item",index_of);
    }).on('click','.view_item .arrow_left',function(){
        index_of = $(this).closest(".modal_block").attr("data-item");
        top_panel_items = par.children(".slide_img").length;
        if(index_of==0){
            index_of = top_panel_items-1;
        }
        else{
            index_of--;
        }
        elem_ = par.children(".slide_img").eq(index_of);
        image_ = elem_.css("background-image");
        title = elem_.attr("title");
        $(".view_item").css("background-image",image_).attr("data-item",index_);
        $(".view_item .title").text(title);
        $(this).closest(".modal_block").attr("data-item",index_of);
    }).on('keydown',document,function(e){
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
        if (ctrlDown && e.keyCode == vKey){
            paste_object();
        }
        if (ctrlDown && e.keyCode == cKey){
            copy_object();
        }
    }).on('keyup',document,function(e){
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
    }).on('click','.gotopage',function(){
        open_modal($(".gotopage_block"));
    }).on('click','#gotopage_btn',function(){
        page_n = parseInt($('#gotopage_block').find(".count").val());
        if(page_n!=''){
            page_n = parseInt($('#gotopage_block').find(".count").val());
            if(page_n>shablon['pages'].length){
                open_modal($(".alert"));
                $("#alert .content_block").html("<span class='title'>Такой страницы не существует</span><input type='button' id='ok_btn' value='Ок'>");
            }
            else{
                page_id = null;
                next_page_id = null;
                if(page_n%2==0){
                    page_id = page_n-2;
                    next_page_id = page_n-1;
                }
                else{
                    page_id = page_n-1;
                    next_page_id = page_n;
                }

                $(".page[data-id-canvas='left']").attr("data-number-page",page_id);
                $(".page[data-id-canvas='right']").attr("data-number-page",next_page_id);

                renderActivePages();
                close_modal($(".gotopage_block"));
            }
        }
    })
})
$('.owl-carousel').owlCarousel({
    margin:30,
    loop:true,
    autoWidth:true,
    nav: false,
    mouseDrag: false,
    responsive:{
        0:{
            items:1,
        },
        480:{
            items: 2
        },
        1000:{
            items:4
        }
    }
});
function open_slide(item){
    // console.log(item);
    // $("#items_slides").trigger('add.owl.carousel', [item]);

    // mob_version();
    // check_items();

    // $("#items_slides").html(slides['type_page'][item]);

    // mob_version();
    check_items();
}
function checkshablon(){ /* просмотр шаблона на наличия пустых значений */
    var error = false;
    var arr_error = [];
    if(shablon['format'] == ''){
        error = true;
        arr_error.push("формат");
    }
    if(shablon['binding'] == ''){
        error = true;
        arr_error.push("переплет");
    }
    if(error){
        open_modal($(".alert"));
        _string = arr_error.join();
        $("#alert .content_block").html("<span class='title'>Необходимо выбрать следующие значения: "+_string+"</span><input type='button' id='ok_btn' value='Ок'>");
    }

    return error;
}
function export_shablon(){ /** Функция для экспорта шаблона клиента со всеми данными + изображениями */
    _c = getNotEmptyPages();
    if(_c>0){
        chk_sh = checkshablon();
        if(!chk_sh){
            $(".process_block").show();
            setTimeout(function(){
                save_imgs()
                to = 50*_c;
                setTimeout(function(){
                    //shablon['imgs'] = imgs;
                    save_shablon(1);
                },to)
            },50)
        }
    }
    else{
        open_modal($(".alert"));
        $("#alert .content_block").html("<span class='title'>Получить пустой блокнот невозможно</span><input type='button' id='ok_btn' value='Ок'>");

    }
}
function save_shablon(_export = null){ /** функция для сохрание шаблона без изображений */
    chk_sh = checkshablon();
    if(!chk_sh){
        action = "save_shablon";
        if(_export != null) action = "export_shablon";
        $.ajax({
            url: "/canvas/save",
            cache: false,
            data: {
                'template': shablon,
                '_token': $('meta[name="csrf-token"]').attr('content'),
                'action': action
            },
            type: "POST",
            success: function (data) {
                //alert('<pre>' + data +  '</pre>');
                console.log("SAVED");
                shablon['id'] = data;
                console.log(data);
                if(_export != null){
                    //$(".process_block").hide();
                    window.location.href = "http://wookki.online/order/create/id="+shablon['id'];
                    location.assign("http://wookki.online/order/create/id="+shablon['id']);
                }
            }
        });
    }
}
function save_imgs(){ /** преобразование содержимого канваса в ссылку ***/
    shablon['imgs'] = [];
    canvas_for_export_img = new fabric.Canvas('for_save_img');

    format = shablon['format'];
    width = shablon['resolut'];

    var factor = format_page[format]['x'] / width;

    canvas_for_export_img.setHeight(canvas_for_export_img.getHeight() * factor);
    canvas_for_export_img.setWidth(canvas_for_export_img.getWidth() * factor);

    for(i=0;i<shablon['pages'].length;i++){
        //$("#process label.i").text(i);
        if(shablon['pages'][i]['fullness']=='notempty'){
            console.log("123");
            canvas_for_export_img.loadFromJSON(shablon['pages'][i]['canvas'], function(){
                if (canvas_for_export_img.backgroundImage) {
                    var bi = canvas_for_export_img.backgroundImage;
                    bi.width = bi.width * factor;
                    bi.height = bi.height * factor;
                }
                var objects = canvas_for_export_img.getObjects();
                if(objects.length>0){
                    for (var j in objects) {
                        var scaleX = objects[j].scaleX;
                        var scaleY = objects[j].scaleY;
                        var left = objects[j].left;
                        var top = objects[j].top;

                        var tempScaleX = scaleX * factor;
                        var tempScaleY = scaleY * factor;
                        var tempLeft = left * factor;
                        var tempTop = top * factor;

                        objects[j].scaleX = tempScaleX;
                        objects[j].scaleY = tempScaleY;
                        objects[j].left = tempLeft;
                        objects[j].top = tempTop;

                        objects[j].setCoords();
                    }
                }
                canvas_for_export_img.renderAll();
                dataURL = canvas_for_export_img.toDataURL('image/png');
                //number = shablon['pages'][i]['number'];
                number = 0;
                shablon['imgs'].push({'number':number,'img':dataURL});
                //document.write("<img src='"+dataURL+"'>");
            });
        }
    }
}
function updateRightPage(id_left){
    if(!$(".page[data-id-canvas='right']").is(":visible")){
        id_right = parseInt(id_left)+1;
        $(".page[data-id-canvas='right']").attr("data-number-page",id_right);
        setTimeout(function(){
            renderActivePages();
        },10)
    }
}
function renderActivePages(){ /** Функция обновления активных странц в конструкторе */
    left_id_page = $(".page[data-id-canvas='left']").attr("data-number-page");
    $(".page[data-number-page='"+left_id_page+"']").attr("data-fullness-page",shablon['pages'][left_id_page]['fullness']);
    if(shablon['pages'][left_id_page]['fullness']=='delete'){
        $(".page[data-number-page='"+left_id_page+"']").find("canvas").hide();
        $(".page[data-number-page='"+left_id_page+"']").find(".page_actions .icon_zoom").hide();
    }
    else if(shablon['pages'][left_id_page]['fullness']=='empty'){
        $(".page[data-number-page='"+left_id_page+"']").find(".page_actions").hide();
    }else{
        $(".page[data-number-page='"+left_id_page+"']").find(".page_actions").show();
        $(".page[data-number-page='"+left_id_page+"']").find("canvas").show();
        $(".page[data-number-page='"+left_id_page+"']").find(".page_actions .icon_zoom").show();
    }
    $(".page[data-id-canvas='left'] .page_number").html(parseInt(shablon['pages'][left_id_page]['number']));
    canvas_left.loadFromJSON(shablon['pages'][left_id_page]['canvas'], function(){canvas_left.renderAll()});

    if(!mobile){
        right_id_page = $(".page[data-id-canvas='right']").attr("data-number-page");
        if(right_id_page!='none'){
            if(!$(".page[data-id-canvas='right']").is(":visible")){
                $(".page[data-id-canvas='right']").show();
            }
            $(".page[data-number-page='"+right_id_page+"']").attr("data-fullness-page",shablon['pages'][right_id_page]['fullness']);
            if(shablon['pages'][right_id_page]['fullness']=='delete'){
                $(".page[data-number-page='"+right_id_page+"']").find("canvas").hide();
                $(".page[data-number-page='"+right_id_page+"']").find(".page_actions .icon_zoom").hide();
            }
            else if(shablon['pages'][right_id_page]['fullness']=='empty'){
                $(".page[data-number-page='"+right_id_page+"']").find(".page_actions").hide();
            }else{
                $(".page[data-number-page='"+right_id_page+"']").find(".page_actions").show();
                $(".page[data-number-page='"+right_id_page+"']").find("canvas").show();
                $(".page[data-number-page='"+right_id_page+"']").find(".page_actions .icon_zoom").show();
            }
            $(".page[data-id-canvas='right'] .page_number").html(shablon['pages'][right_id_page]['number']);
            canvas_right.loadFromJSON(shablon['pages'][right_id_page]['canvas'], function(){canvas_right.renderAll()});
        }
        else{
            $(".page[data-id-canvas='right']").hide();
        }
    }

    $("#count_pages").text(getNotEmptyPages());
}
function updatepage(id){ /** функция обновления состояния страницы (сохранение текущего состояния страницы,запись прошлого состояния в массив) */
    setTimeout(function(){
        json_canvas = JSON.stringify(active_canvas);

        if(shablon['pages'][id]['canvas']!=json_canvas){
            res_pages = [];
            can_pages.push({'id_page':id,'json':shablon['pages'][id]['canvas'],'draw':shablon['pages'][id]['draw'],'fullness':shablon['pages'][id]['fullness']});
            if(can_pages.length>20){
                can_pages.splice(0,1);
            }
            shablon['pages'][id]['canvas'] = json_canvas;
            //console.log(id_canvas);

            if(active_canvas.getObjects().length>0){
                shablon['pages'][id]['draw'] = true;
                shablon['pages'][id]['fullness']='notempty';
                $(".page[data-number-page='"+id+"']").find(".page_actions").show();
            }
            else if(active_canvas.getObjects().length == 0){
                shablon['pages'][id]['draw'] = false;
                if(!active_canvas.backgroundImage){
                    shablon['pages'][id]['fullness']='empty';
                    $(".page[data-number-page='"+id+"']").find(".page_actions").hide();
                }
            }


            //alert(active_canvas.getObjects().length);
        }
        $("#count_pages").text(getNotEmptyPages());
    },10)
}
function loadContruct(){ /** функция загрузки конструктора с шаблона */
    mob_version();
    if(shablon['id']==null){
        addEmptyPages();
    }
    renderActivePages();
    if(shablon['lang_page']['opt'] != ''){
        _opt = shablon['lang_page']['opt'];
        $(".lang_menu_item[data-opt='"+_opt+"']").addClass("active");

        title = $(".lang_menu_item[data-opt='"+_opt+"']").text();
        $(".lang_menu_item[data-opt='"+_opt+"']").closest(".dropdown_menu").siblings(".title").children(".hide_drop").text(title);
        _opt = null;
    }
    if(shablon['type_page']['opt'] != ''){
        _opt = shablon['type_page']['opt'];
        $(".type_menu_item[data-opt='"+_opt+"']").addClass("active");

        title = $(".type_menu_item[data-opt='"+_opt+"']").text();
        $(".type_menu_item[data-opt='"+_opt+"']").closest(".dropdown_menu").siblings(".title").children(".hide_drop").text(title);
        _opt = null;
    }
    if(shablon['format'] != ''){
        $("input[id='format-"+shablon['format']+"']").prop('checked',true)
    }
    if(shablon['binding'] != ''){
        $("input[id='binding-"+shablon['binding']+"']").prop('checked',true)
    }
    if(shablon['cover']['opt'] != ''){
        $("input[id='cover-"+shablon['cover']['opt']+"']").prop('checked',true);
    }

    var _width_page = $(".page").width();
    shablon['resolut'] = _width_page;
}
function addfiles(files){
    if (files && files[0]) {
        $(".nothing_img").remove();

        for(i=0;i<files.length;i++){
            var reader = new FileReader();
            reader.readAsDataURL(files[i]);

            reader.onload = function (e) {
                preview_imgs.push(e.target.result);
            }
        }
        setTimeout(function(){
            $(".preview .images_block .items_block_line .item").css("background-image","url("+preview_imgs[0]+")");
            $(".preview .images_block .items_block_line").attr("data-item","0");
        },100);
    }
}
function eventedObjects(ev){
    var objects = active_canvas.getObjects();
    if(objects.length>0){
        for (var j in objects) {
            objects[j]['evented'] = ev;
        }
    }
}
function copy_object(){
    copiedObject = null;
    if(active_canvas.getActiveObject()){
        var object = fabric.util.object.clone(active_canvas.getActiveObject());
        copiedObject = object;
    }
}
function paste_object(){
    if(copiedObject){
        copiedObject= fabric.util.object.clone(copiedObject);
        copiedObject.set("top", 150);
        copiedObject.set("left", 150);
        active_canvas.add(copiedObject);
        active_canvas.item(active_canvas.size() - 1).hasControls = true;
    }
}
function getNotEmptyPages(){
    _c_p = 0;
    for(i=0;i<shablon['pages'].length;i++){
        if(shablon['pages'][i]['fullness']=='notempty'){
            _c_p++;
        }
    }
    return _c_p;
}
function getNotDeletedPages(){
    _c_p = 0;
    for(i=0;i<shablon['pages'].length;i++){
        if(shablon['pages'][i]['fullness']!='delete'){
            _c_p++;
        }
    }
    return _c_p;
}
function getAllPages(){
    return shablon['pages'].length;
}
function addEmptyPages(){
    for(i=0;i<280;i++){
        shablon['pages'].push({'number':i+1,'canvas':'{"objects":[]}','style_page':'none','fullness':'empty','draw':false,'type':'doublepage','price':0});
    }
}
function checkTypeIdcanvas(x,y){
    return_info = {
        'id_canvas':'',
        'id_page':'',
        'draw':null,
        'fullness':''
    }
    _left_c = $(".page[data-id-canvas='left']");
    _right_c = $(".page[data-id-canvas='right']");

    f_x_l = parseInt(_left_c.offset().left);
    f_y_l = parseInt(_left_c.offset().top);

    f_x_r = parseInt(_right_c.offset().left);
    f_y_r = parseInt(_right_c.offset().top);

    if((f_x_l <= x && x <= f_x_l+_left_c.width()) && (f_y_l <= y && y <= f_y_l+_left_c.height()) ){
        return_info['id_canvas'] = 'left';
        return_info['id_page'] = $(".page[data-id-canvas='left']").attr("data-number-page");
        return_info['draw'] = shablon['pages'][return_info['id_page']]['draw'];
        return_info['fullness'] = shablon['pages'][return_info['id_page']]['fullness'];
    }
    else if((f_x_r <= x && x <= f_x_r+_right_c.width()) && (f_y_r <= y && y <= f_y_r+_right_c.height()) ){
        return_info['id_canvas'] = 'right';
        return_info['id_page'] = $(".page[data-id-canvas='right']").attr("data-number-page");
        return_info['draw'] = shablon['pages'][return_info['id_page']]['draw'];
        return_info['fullness'] = shablon['pages'][return_info['id_page']]['fullness'];
    }

    return return_info;
}
function checkLogin(){
    var _return = true;
    if(typeof LOGIN !== 'undefined' && LOGIN == ''){
        open_modal($(".alert"));
        $("#alert .content_block").html("<span class='title'>Вы не авторизированы.<br>Пройдите авторизацию для сохранений изменений в конструкторе</span><input type='button' id='ok_btn_join' value='Войти'>");
        _return = false;
    }
    console.log(_return);
    return _return;
}
$("#change").click(function(){ /** для тестирования */
    console.log(shablon);
})
elem = document.getElementsByClassName("items_block_line");
elem.onselectstart = function() {
    return false;
};
