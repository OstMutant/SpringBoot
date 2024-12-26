package org.ost.investigate.springboot.examples.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@Controller
public class WebController {
    @GetMapping(value = "/index")
    public String index() {
        return "index";
    }
}
