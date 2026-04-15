<php 
{
        $sql = "Update {$table} set valid_qbs='N' where subcode='" . $Valuation_Data[0]->subcode . "' and barcode='" . $Valuation_Data[0]->barcode . "' and eva_id='".$Valuation_Data[0]->eva_id."'";
        $S_Update = $this->db->Section_Update($sql);

        foreach ($Section_Data as $keyS => $S_Data) {
            $Sst = $S_Data->FROM_QST
            ;
            $Est = $S_Data->TO_QST
            ;
            $Noqst = $S_Data->NOQST;
            $MARK_MAX= $S_Data->MARK_MAX;
            $C_QST=$S_Data->C_QST;
            foreach ($Valuation_Data as $key => $V_Data) {

                if ($S_Data->SUB_SEC != 'ab' && $S_Data->SECTION == $V_Data->section && $V_Data->qbno >= $Sst && $V_Data->qbno <= $Est) {

                    $mrkdata = $V_Data->Marks_Get;
                        if (!is_numeric($mrkdata)) {
                            $mrkdata = -0.1;
                        }
                        if(! isset($Mark[$V_Data->qbno])){
                            $Mark[$V_Data->qbno] = $mrkdata;
                            }else{
                             $Omark = $Mark[$V_Data->qbno];            
                             $Mark[$V_Data->qbno] = $mrkdata+$Omark;
                            }

                    // if ($V_Data->add_sub_section == '' || $V_Data->add_sub_section == 'i' || $V_Data->add_sub_section == 'a' ) {
                    //     $mrkdata = $V_Data->Marks_Get;
                    //     //if(!empty($Mark[$V_Data->qbno])){}
                    //     if (!is_numeric($mrkdata)) {
                    //         $mrkdata = -0.1;
                    //     }
                    //     $Mark[$V_Data->qbno] = $mrkdata;
                    //     $Marka[$V_Data->qbno] = $mrkdata;
                    // } else {
                    //     $Omark = $Marka[$V_Data->qbno];
                    //     $mrkdata = $V_Data->Marks_Get;
                    //     if (!is_numeric($mrkdata)) {
                    //         $mrkdata = -0.1;
                    //     }
                    //     $Mark[$V_Data->qbno] = $Omark + $mrkdata;

                    // }
                } else if ($S_Data->SECTION == $V_Data->section && $V_Data->qbno >= $Sst && $V_Data->qbno <= $Est) {
                    if ($V_Data->sub_section == 'a') {
                        if ($V_Data->add_sub_section == '' || $V_Data->add_sub_section == 'i') {
                            $mrkdata = $V_Data->Marks_Get;
                            $mrkdataa = $V_Data->Marks_Get;
                            $mrkdataaa = $V_Data->Marks_Get;
                            if (!is_numeric($mrkdata)) {
                                $mrkdata = 0;
                                $mrkdataa = -0;
                                $mrkdataaa=-0.001;
                            }
                            $Marka[$V_Data->qbno] = $mrkdata;
                            $Markaa[$V_Data->qbno] = $mrkdataa;
                            $Markaaa[$V_Data->qbno] = $mrkdataaa;
                        } else {
                            $Omark = $Marka[$V_Data->qbno];
                            $mrkdata = $V_Data->Marks_Get;
                            $mrkdataa = $V_Data->Marks_Get;
                            $mrkdataaa = $V_Data->Marks_Get;
                            if (!is_numeric($mrkdata)) {
                                $mrkdata = 0;
                                $mrkdataa = -0;
                                $mrkdataaa=-0.001;
                            }
                            $Marka[$V_Data->qbno] = $Omark + $mrkdata;
                            $Markaa[$V_Data->qbno] = $Omark + $mrkdataa;
                            $Markaaa[$V_Data->qbno] = $Omark + $mrkdataaa;

                        }
                    } elseif ($V_Data->sub_section == 'b' && ($S_Data->SECTION == $V_Data->section && $V_Data->qbno >= $Sst && $V_Data->qbno <= $Est)) {
                        if ($V_Data->add_sub_section == '' || $V_Data->add_sub_section == 'i') {
                            $mrkdata = $V_Data->Marks_Get;
                            $mrkdataa = $V_Data->Marks_Get;
                            $mrkdataaa = $V_Data->Marks_Get;
                            if (!is_numeric($mrkdata)) {
                                $mrkdata = 0;
                                $mrkdataa = -0;
                                $mrkdataaa=-0.001;
                            }
                            $Markb[$V_Data->qbno] = $mrkdata;
                            $Markbb[$V_Data->qbno] = $mrkdataa;
                            $Markbbb[$V_Data->qbno] = $mrkdataaa;
                        } else if ($S_Data->SECTION == $V_Data->section && $V_Data->qbno >= $Sst && $V_Data->qbno <= $Est) {
                            $Omark = $Markb[$V_Data->qbno];
                            $mrkdata = $V_Data->Marks_Get;
                            $mrkdataa = $V_Data->Marks_Get;
                            $mrkdataaa = $V_Data->Marks_Get;
                            if (!is_numeric($mrkdata)) {
                                $mrkdata = 0;
                                $mrkdataa = -0;
                                $mrkdataaa = -0.001;
                            }
                            $Markb[$V_Data->qbno] = $Omark + $mrkdata;
                            $Markbb[$V_Data->qbno] =$Omark + $mrkdataa;
                            $Markbbb[$V_Data->qbno] =$Omark + $mrkdataaa;
                        }
                    }
                }

            }
            if ($S_Data->SUB_SEC != 'ab') {

                //$MARK_MAX
                $C_QST=$S_Data->C_QST;
                
                if($C_QST !="" || $C_QST !=NULL){
                    $Mrk_Restriction=explode(",",$C_QST);
                        for ($iqst=0; $iqst < count($Mrk_Restriction) ; $iqst++) { 
                          $Mark[$Mrk_Restriction[$iqst]]=$MARK_MAX;
                        }
                        arsort($Mark);
                    }else{
                        arsort($Mark);
                    }

    
                $aa1 = '';
                $aa2 = '';
                $aa = array_keys($Mark);
                for ($x = 0; $x < $Noqst; $x++) {
                    $Vartbl = ($aa[$x]) . ',';
                    unset($Mark);
                    $aa1 = $aa1 . $Vartbl;
                }
                $aa2 = substr($aa1, 0, (strlen($aa1) - 1));

                $sql = "Update {$table}  set valid_qbs='Y' where eva_id='". $V_Data->eva_id .  "' and  SUBCODE='" . $V_Data->subcode . "' and barcode='" . $V_Data->barcode . "' and qbno in(" . $aa2 . ") and Marks_Get REGEXP '[0-9 .]'";
                $S_Update = $this->db->Section_Update($sql);
                $aa = 0;
                // mysqli_query($conn, $sql5);
            } else {
                for ($x = $Sst; $x <= $Est; $x++) {
                    if (($Marka[$x] >= $Markb[$x]) && $Markaa[$x] >= 0) {
                        if($Marka[$x]==0 && $Markb[$x]==0 &&  $Markaa[$x]==0){
                            if($Markaaa[$x] < $Markbbb[$x]){
                                $sql = "Update {$table}  set valid_qbs='Y' where eva_id='". $V_Data->eva_id .  "' and SUBCODE='" . $V_Data->subcode . "' and barcode='" . $V_Data->barcode . "' and qbno=" . $x . " and sub_section='b' and Marks_Get REGEXP '[0-9 .]'";
                                $S_Update = $this->db->Section_Update($sql);
                            }
                        }else{
                            $sql = "Update {$table}  set valid_qbs='Y' where eva_id='". $V_Data->eva_id .  "' and SUBCODE='" . $V_Data->subcode . "' and barcode='" . $V_Data->barcode . "' and qbno=" . $x . " and sub_section='a' and Marks_Get REGEXP '[0-9 .]'";
                            $S_Update = $this->db->Section_Update($sql);
                        }
                        // mysqli_query($conn, $sql5);
                    } elseif ($Markbb[$x] >= 0) {
                        $sql = "Update {$table}  set valid_qbs='Y' where eva_id='". $V_Data->eva_id .  "' and SUBCODE='" . $V_Data->subcode . "' and barcode='" . $V_Data->barcode . "' and qbno=" . $x . " and sub_section='b' and Marks_Get REGEXP '[0-9 .]'";
                        $S_Update = $this->db->Section_Update($sql);
                        // mysqli_query($conn, $sql5);
                    }
                }
            }

        }

    }
